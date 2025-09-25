# SRE 平台後端契約檢查報告

**版本**: 1.0
**日期**: 2025-09-24
**審查者**: Jules (資深系統架構師與資料建模專家)

## 1. 總結

本次契約審查旨在對 SRE 平台的後端契約 (`openapi.yaml`, `db_schema.sql`) 進行全面性檢查與精簡，確保其與功能規格 (`specs.md`) 及架構原則 (`architecture.md`) 保持一致。

審查發現，現有契約在很大程度上遵循了「統一管理層」的設計哲學，職責劃分清晰。然而，仍然存在一些冗餘、不一致和缺失之處需要修正，以達到更精簡、更一致的狀態。

本報告將詳細列出所有發現的問題點，並提出具體的修正建議。

---

## 2. 問題清單與修正建議

### 2.1 API 與資料庫契約不一致

#### **問題 2.1.1：通知管道關聯方式不一致**

-   **問題描述**:
    `openapi.yaml` 中，`AutomationSchedulePayload` 和 `NotificationStrategyPayload` 允許客戶端直接傳入一個名為 `channels` 的管道 ID 陣列。然而，`db_schema.sql` 中對應的資料表 (`automation_schedules`, `notification_strategies`) 並沒有此欄位，而是使用一個獨立的多對多關聯表 `notification_channel_links` 來管理此關聯。這導致 API 契約與資料庫實現完全衝突。

-   **影響**:
    前端開發者依照 API 契約開發，但後端無法依此儲存資料，將導致功能開發失敗。

-   **修正建議**:
    **方案：統一採用關聯表模型。**
    1.  **移除 API 欄位**: 從 `openapi.yaml` 的 `AutomationSchedulePayload` 和 `NotificationStrategyPayload` 中移除 `channels` 陣列欄位。
    2.  **保留資料庫結構**: 維持 `notification_channel_links` 關聯表的設計，因為它更符合正規化，並能儲存額外的關聯資訊（如自訂範本）。
    3.  **新增管理端點 (可選)**: 若有需要，可以考慮新增專門的 API 端點來管理這些關聯，例如 `POST /notifications/strategies/{strategy_id}/channels`，但為了精簡，更建議在建立/更新主體（策略/排程）後，由後端服務根據請求中的其他資訊來處理關聯。在此次精簡中，我們假設後端業務邏輯會處理此關聯，故僅需修正 API Payload。

### 2.2 Schema/欄位冗餘與不一致

#### **問題 2.2.1：通用 Schema `BaseSummary` 未被使用**

-   **問題描述**:
    `openapi.yaml` 中定義了一個通用的 `BaseSummary` Schema，包含了 `id`, `name`, `description`, `created_at`, `updated_at` 等欄位。但 `TeamSummary`, `DashboardSummary` 等多個摘要 (Summary) 型的 Schema 卻是重複定義這些欄位，而沒有透過 `allOf` 來繼承 `BaseSummary`。

-   **影響**:
    造成 `openapi.yaml` 文件冗長，維護性差。當需要修改通用欄位（例如新增 `updated_by`）時，需要在多個地方手動修改，容易遺漏。

-   **修正建議**:
    **方案：全面採用 `allOf` 繼承 `BaseSummary`。**
    1.  修改所有摘要型 Schema (如 `TeamSummary`, `DashboardSummary`, `SilenceRuleSummary` 等)，使用 `allOf` 關鍵字來引用 `$ref: '#/components/schemas/BaseSummary'`。
    2.  從這些 Schema 中移除重複定義的通用欄位。

#### **問題 2.2.2：`SilenceMatcher` 與 `GrafanaMatcher` 結構不一致**

-   **問題描述**:
    `SilenceMatcher` (平台內部使用) 和 `GrafanaMatcher` (為相容 Grafana API) 兩個 Schema 用於相同的「標籤匹配」概念，但結構和欄位命名完全不同 (`matcher_key` vs `name`, `matcher_value` vs `value`, `operator` vs `isRegex`)。

-   **影響**:
    增加了前端開發的複雜度，前端需要為兩個相似但不同的資料結構編寫兩套處理邏輯。

-   **修正建議**:
    **方案：將 `SilenceMatcher` 的結構與 `GrafanaMatcher` 對齊。**
    1.  修改 `openapi.yaml` 中的 `SilenceMatcher` Schema，將其欄位改為 `name`, `value`, `isRegex`，與 `GrafanaMatcher` 保持一致。
    2.  同步修改 `db_schema.sql` 中的 `silence_rule_matchers` 資料表欄位，將 `matcher_key` 改為 `name`，`matcher_value` 改為 `value`，並將 `operator` 欄位改為 `is_regex BOOLEAN`。

#### **問題 2.2.3：更新請求中包含不應由客戶端提供的時間戳**

-   **問題描述**:
    `openapi.yaml` 中的 `SystemSettingsUpdateRequest` Schema 包含了 `created_at` 和 `updated_at` 欄位。這類時間戳應由資料庫或後端服務自動生成與更新，不應由客戶端在更新請求中傳遞。

-   **影響**:
    給予客戶端控制伺服器端核心時間戳的能力，存在潛在的資料不一致風險。這很可能是定義時的複製貼上錯誤。

-   **修正建議**:
    **方案：從請求 Schema 中移除時間戳欄位。**
    1.  修改 `openapi.yaml`，從 `SystemSettingsUpdateRequest` 的定義中移除 `created_at` 和 `updated_at` 欄位。

### 2.3 契約完整性缺失

#### **問題 2.3.1：資源列表頁缺少彙總指標的 API**

-   **問題描述**:
    `specs.md` (UI 規格) 要求在資源列表頁面直接顯示 `CPU 使用率`, `記憶體使用率` 等即時效能指標。然而，根據 `architecture.md` 的原則，這些時序資料儲存在 VictoriaMetrics 中，`db_schema.sql` 的 `resources` 表也已正確地移除了這些欄位。`openapi.yaml` 中 `/resources` 的回應 `ResourceSummary` 也因此不包含這些指標。

-   **影響**:
    API 契約無法滿足 UI 功能需求，前端無法取得所需資料來渲染頁面。

-   **修正建議**:
    **方案：新增一個專門的彙總查詢參數，而非新增 API。**
    1.  **擴充現有 API**: 在 `GET /resources` 端點新增一個布林查詢參數，例如 `include_metrics=true`。
    2.  **後端實現彙總**: 當 `include_metrics` 為 `true` 時，後端在查詢 `resources` 表後，再額外向 VictoriaMetrics 發起一個批次查詢，獲取列表中所有資源的最新指標，並將結果合併到 `ResourceSummary` 中再回傳。
    3.  **更新 Schema**: 在 `openapi.yaml` 的 `ResourceSummary` Schema 中，新增 `cpu_usage`, `memory_usage`, `disk_usage` 等可選欄位，並註明這些欄位僅在 `include_metrics=true` 時回傳。
    4.  **優點**: 此方案不需新增 API 端點，保持了 API 的簡潔性，同時滿足了 UI 需求，也符合後端微服務的資料查詢模式。

---

## 3. 下一步計畫

根據以上問題清單與建議，後續將依序執行以下操作：
1.  **更新 `db_schema.sql`**: 修正 `silence_rule_matchers` 表的欄位。
2.  **更新 `openapi.yaml`**: 應用所有 Schema 繼承、欄位修正與 API 參數擴充。
3.  **更新 `mock-server/`**: 確保 Mock Server 的行為與更新後的契約完全一致。
4.  提交所有變更以供審查。