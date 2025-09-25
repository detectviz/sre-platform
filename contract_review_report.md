# SRE 平台後端契約審查報告

**版本**: 1.0
**審查日期**: 2025-09-24
**審查員**: Jules (資深系統架構師)

## 1. 總結

本次審查旨在對 SRE 平台的後端契約 (`openapi.yaml`, `db_schema.sql`) 進行全面性檢查與精簡，確保其與架構原則 (`architecture.md`)、UI 規格 (`specs.md`) 和開發規範 (`AGENT.md`) 完全對齊。

審查發現，目前契約在遵守「統一管理層」和「系統邊界」的核心原則方面做得相當不錯，特別是在告警規則代理和身份認證委派方面。然而，依然存在一些重大的架構衝突、冗餘和不一致的問題，亟待解決。

**主要問題類別：**

*   **重大架構衝突 (Critical Architecture Violation):** 在 PostgreSQL 中儲存時序指標資料，與「VictoriaMetrics 為唯一真實來源」的原則相悖。
*   **系統邊界模糊 (Blurred System Boundary):** 靜音規則的 API 設計混淆了平台自身職責與應代理給 Grafana 的職責。
*   **冗餘與不一致 (Redundancy & Inconsistency):** API 和資料庫中存在重複的 Schema 定義和不一致的命名慣例。

本報告將詳細闡述這些問題，並提出具體的修正方案。

---

## 2. 問題清單與修正建議

### 2.1. 重大架構衝突

#### **問題 2.1.1：在 PostgreSQL 中儲存時序指標資料**

*   **現象**:
    *   `db_schema.sql` 中定義了 `resource_metrics`、`system_metric_snapshots` 資料表和 `resource_load_rollups` 檢視。
    *   `openapi.yaml` 中定義了 `GET /metrics`、`POST /metrics/query` 和 `GET /analysis/resource-load` 等 API，直接對上述 PostgreSQL 資料表進行操作。
*   **影響**:
    *   **嚴重違反架構原則**: `architecture.md` 明確規定 **VictoriaMetrics** 是時序資料的唯一真實來源 (SSOT)。此設計造成了資料源混亂與資料冗餘。
    *   **效能瓶頸**: 使用關聯式資料庫儲存和查詢高基數的時序資料，將會導致嚴重的效能問題和擴展性挑戰。
    *   **維護成本高**: 需要維護兩套不同的指標儲存系統及其資料同步（如果有的話）。
*   **修正建議**:
    1.  **刪除資料庫物件**: 從 `db_schema.sql` 中徹底移除 `resource_metrics`, `system_metric_snapshots` 資料表和 `resource_load_rollups` 檢視。
    2.  **刪除冗餘 API**: 從 `openapi.yaml` 中徹底移除 `GET /metrics`、`POST /metrics/query` 和 `GET /analysis/resource-load` 這三個 API 端點。
    3.  **重構現有 API**: 對於 `GET /resources/{resource_id}/metrics`，保留此端點，但修改其內部實作，使其從查詢本地資料庫改為 **代理查詢 VictoriaMetrics**。需在 `openapi.yaml` 的端點描述中明確這一點，以反映其代理職責。

### 2.2. 系統邊界模糊

#### **問題 2.2.1：靜音規則 (Silence Rules) API 職責不清**

*   **現象**:
    *   `POST /silence-rules` 這個 API 同時處理兩種不同職責的靜音：
        1.  **週期性靜音 (Recurring Silences)**: 這是平台提供的核心增值功能，符合架構原則。
        2.  **單次快速靜音 (Quick/Single Silences)**: 其 schema 包含 `event_id` 欄位，用於為特定事件建立一次性靜音。根據 `AGENT.md` 和 `architecture.md`，此功能是 Grafana 的核心職責，平台應作為代理。
*   **影響**:
    *   單一 API 端點混淆了兩種不同的系統邊界，增加了後端邏輯的複雜性，也違反了單一職責原則。
*   **修正建議**:
    1.  **拆分 API**:
        *   **保留 `POST /silence-rules`**: 將其職責限定為**僅處理週期性靜音**。從其請求 Schema (`SilenceRuleUpsertRequest`) 中移除 `event_id` 和 `duration_hours` 等與快速靜音相關的欄位。
        *   **新增代理 API**: 建立一個新的 API 端點，例如 `POST /grafana-proxy/silences`，專門用於**代理建立對 Grafana 的一次性靜音**。此 API 的請求 body 應直接對應 Grafana API 所需的格式。

### 2.3. 冗餘與不一致

#### **問題 2.3.1：API Schema 結構冗餘**

*   **現象**:
    *   `openapi.yaml` 中大量 `Detail` 結尾的 Schema（如 `EventDetail`, `ResourceDetail`, `DashboardDetail`）重新定義了所有欄位，而不是使用 `allOf` 繼承自對應的 `Summary` Schema。
*   **影響**:
    *   **維護困難**: 當 `Summary` Schema 變更時，需要手動同步更新所有相關的 `Detail` Schema，極易出錯。
    *   **契約臃腫**: 造成 `openapi.yaml` 文件體積過大，可讀性下降。
*   **修正建議**:
    *   全面重構 `openapi.yaml` 中的 Schema。讓所有 `*Detail` Schema 使用 `allOf` 關鍵字繼承自對應的 `*Summary` Schema，然後只定義額外新增的欄位。
    *   **範例**:
        ```yaml
        EventDetail:
          allOf:
            - $ref: "#/components/schemas/EventSummary"
            - type: object
              properties:
                # 只需定義 Detail 比 Summary 多出來的欄位
                timeline:
                  type: array
                  items:
                    $ref: "#/components/schemas/EventTimelineEntry"
        ```

#### **問題 2.3.2：命名慣例不一致**

*   **現象**:
    *   **建立者欄位混用**: `db_schema.sql` 和 `openapi.yaml` 中同時存在 `creator_id`, `created_by`, `owner_id` 等欄位，指代同一概念。
    *   **API 回應物件混用**: 有些 API 回應中使用 `creator` 物件，有些則使用 `owner` 或 `assignee`。
    *   **路徑命名**: `notification-config` 這個路徑前綴顯得有些冗長，可以精簡。
*   **影響**:
    *   降低了契約的可預測性和開發者體驗。前端開發人員需要記住不同情境下的不同命名，容易出錯。
*   **修正建議**:
    1.  **統一建立者欄位**:
        *   在 `db_schema.sql` 中，統一使用 `created_by` 作為外鍵欄位。
        *   在 `openapi.yaml` 的 **Request Body** 中，統一使用 `creator_id`。
        *   在 `openapi.yaml` 的 **Response Body** 中，統一使用 `creator` 物件 (`CreatorInfo` schema)。
    2.  **統一 API 路徑**:
        *   建議將 `/notification-config/strategies` 精簡為 `/notification-strategies`。
        *   建議將 `/notification-config/channels` 精簡為 `/notification-channels`。
        *   建議將 `/notification-config/history` 精簡為 `/notification-history`。
    3.  **全面檢查 `snake_case`**: 確保所有 API 參數、Schema 屬性都嚴格遵守 `snake_case` 命名法。

---

## 3. 預期效益

完成上述修正後，預期將帶來以下效益：

*   **架構清晰**: 後端契約將與「統一管理層」的架構原則完全對齊，職責邊界分明。
*   **效能提升**: 移除在 PostgreSQL 中的指標儲存，從根本上避免未來可能出現的效能瓶頸。
*   **可維護性增強**: 統一的命名和精簡的 Schema 結構將大幅降低未來維護契約的複雜度和出錯率。
*   **開發體驗改善**: 一致且可預測的 API 將提升前端團隊的開發效率。

這份報告將作為後續重構工作的指導性文件。