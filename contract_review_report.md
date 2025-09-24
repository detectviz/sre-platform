# SRE 平台後端契約審查與精簡報告

**版本**: 1.0
**審查員**: Jules (資深系統架構師)
**日期**: 2025-09-24

## 1. 總體評價

SRE 平台的後端契約 (`openapi.yaml`, `db_schema.sql`) 整體設計良好，結構清晰，高度遵循了 `architecture.md` 中定義的「統一管理層」架構哲學。資料庫 schema 嚴格遵守了與外部系統（Grafana, Keycloak）的邊界，專注於實現平台的附加價值功能。

然而，在細節層面，仍存在一些可以精簡和統一的空間，以進一步提升契約的一致性、可維護性，並降低前端的整合複雜度。本報告將逐一分析這些點，並提出具體修正建議。

## 2. 發現問題與建議

### 2.1 功能與路徑冗餘

#### 問題 1：`/events/{event_id}/actions` vs. `/events/{event_id}` (PATCH)
- **現象**:
  - `POST /events/{event_id}/actions` 端點用於執行特定動作，如 `acknowledge`, `assign`, `resolve`。
  - `PATCH /events/{event_id}` 端點也可用於更新事件狀態，例如將 `status` 更新為 `in_progress` 或 `resolved`。
- **分析**: 這兩種方式在功能上存在重疊。`actions` 端點更符合 RPC 風格，語意明確；而 `PATCH` 端點則更符合 RESTful 風格。雖然 `specs.md` 中有提到 `actions` 的使用，但同時保留兩種方式會增加前端的困惑和後端的複雜性。
- **建議**:
  - **統一使用 `POST /events/{event_id}/actions`** 來處理所有狀態變更。
  - **棄用 `PATCH /events/{event_id}`** 或限制其只能更新非狀態欄位（如 `notes`, `service_impact`）。這樣可以使狀態轉換的邏輯更集中、更可控。

---

### 2.2 Schema 與欄位冗餘

#### 問題 2：多個實體中重複的 `creator`/`owner` 欄位
- **現象**:
  - `teams` 表有 `owner_id`。
  - `silence_rules`, `automation_scripts` 等表有 `created_by`。
  - `dashboards` 表有 `owner_id`。
- **分析**: 這些欄位都指向 `users` 表，語意上都是「建立者」或「擁有者」。雖然在不同上下文中名稱略有不同可以理解，但 API schema 中可以統一。
- **建議**:
  - **資料庫層面**: 維持現狀，`owner_id` 和 `created_by` 的命名在各自的表中有其語意，是可接受的。
  - **API Schema 層面**: 在所有相關的 API Response Schema 中，統一使用一個 `owner` 或 `creator` 物件，該物件包含 `user_id` 和 `display_name`。例如：
    ```yaml
    # 建議的統一結構
    CreatorInfo:
      type: object
      properties:
        user_id:
          type: string
          format: uuid
        display_name:
          type: string
    ```
    這樣前端就不需要關心後端欄位是 `owner_id` 還是 `created_by`，並且可以直接顯示名稱，減少了一次額外的 API 請求。

#### 問題 3：重複的 `XXXSummary` 和 `XXXDetail` 結構
- **現象**:
  - `openapi.yaml` 中大量存在 `EventSummary` vs. `EventDetail`, `ResourceSummary` vs. `ResourceDetail` 等成對的 schema。`Detail` 版本通常是 `Summary` 版本的擴展。
- **分析**: 這種模式是 RESTful API 的常見實踐，用於區分列表頁（輕量）和詳情頁（完整）的資料負載。這是合理的設計，**不建議合併**。
- **建議**: **維持現狀**。但需要確保 `Detail` schema 總是透過 `allOf` 組合 `Summary` schema 來實現，以保證 DRY (Don't Repeat Yourself) 原則。經檢查，目前已遵循此原則。

---

### 2.3 一致性問題

#### 問題 4：API 與資料庫命名不一致
- **現象**:
  - DB: `silence_rules.id` (UUID), API: `silence_id` (string)
  - DB: `events.id` (UUID), API: `event_id` (string)
  - DB: `alert_rule_extensions.rule_uid` (string), API: `rule_uid` (string)
- **分析**: API 的 `_id` 後綴和 DB 的 `id` 主鍵命名不一致是常見情況，通常是為了讓 API 更具可讀性。`rule_uid` 的一致性很好。
- **建議**: **維持現狀**。這屬於可接受的抽象層差異，只要在後端做好映射即可。

#### 問題 5：時間戳欄位命名不一致
- **現象**:
  - 大部分表使用 `created_at`, `updated_at`。
  - `security_login_history` 使用 `login_time`。
  - `audit_logs` 使用 `time`。
- **分析**: `login_time` 和 `time` 的語意非常明確，但與 `created_at` 相比缺乏一致性。
- **建議**:
  - **長期建議**: 在未來的重構中，考慮將 `security_login_history.login_time` 和 `audit_logs.time` 統一為 `created_at`，並可以新增 `action_time` 等欄位來表示業務時間。
  - **短期建議**: **維持現狀**，因為修改會影響現有查詢。但在 API 層面，可以考慮在 response 中將這些欄位別名為 `timestamp` 或 `createdAt` 以提供更一致的前端體驗。

---

### 2.4 精簡化機會

#### 問題 6：`user_notifications` 表的必要性
- **現象**:
  - `user_notifications` 表儲存了發送給特定用戶的通知。
  - `notification_history` 表也記錄了所有發送的通知，包括接收者。
- **分析**: `user_notifications` 似乎是 `notification_history` 的一個子集和冗餘。所有「我的通知」列表的內容，都可以通過查詢 `notification_history` where `recipient` contains `current_user_id` 來實現。
- **建議**:
  - **合併表格**: **移除 `user_notifications` 表**。
  - **修改 API**:
    - `GET /notifications` 和 `GET /notifications/summary` 的後端邏輯修改為查詢 `notification_history` 表。
    - 這將簡化資料庫結構，並確保通知數據的單一來源。

#### 問題 7：`team_members` 和 `team_subscribers` 表
- **現象**:
  - `team_members` 儲存團隊的正式成員。
  - `team_subscribers` 儲存團隊的訂閱者（可以是成員，也可以是其他團隊或外部頻道）。
- **分析**: 這兩個表的職責劃分是清晰的。`members` 擁有權限，而 `subscribers` 僅接收通知。這符合 `specs.md` 中對團隊和通知的描述。
- **建議**: **維持現狀**。這不是冗餘，而是合理的職責分離。

## 3. 修正方案總結

1.  **【API 精簡】**:
    - **統一事件狀態變更入口**: 棄用 `PATCH /events/{event_id}` 來變更狀態，統一使用 `POST /events/{event_id}/actions`。

2.  **【Schema 統一】**:
    - **統一擁有者/建立者資訊**: 在 API 回應中，將 `owner_id` 和 `created_by` 等欄位統一封裝成 `creator` 物件，包含 `user_id` 和 `display_name`。

3.  **【資料庫精簡】**:
    - **移除 `user_notifications` 表**: 將其功能合併到 `notification_history` 表，由後端 API 直接查詢 `notification_history` 來提供個人通知列表。

## 4. 下一步計畫

1.  **更新 `openapi.yaml`**: 根據上述建議，調整 API 路徑和 schema 定義。
2.  **更新 `db_schema.sql`**: 移除 `user_notifications` 表及其相關約束。
3.  **更新 `mock-server`**: 調整 mock server 的邏輯以符合新的契約。
4.  **最終驗證**: 確保所有變更都已正確應用且服務可正常運行。
