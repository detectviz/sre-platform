# SRE 平台後端契約檢查報告

**日期**: 2025-09-24
**審查者**: Jules (資深前端開發者)
**目標**: 確保 `openapi.yaml` 與 `db_schema.sql` 契約的完整性、正確性與一致性，以支撐前端完整開發。

---

## 1. 總體結論

經過對 `architecture.md`、`specs.md`、`openapi.yaml` 和 `db_schema.sql` 的全面交叉比對，我發現當前的後端契約覆蓋了絕大部分的核心功能，且在架構設計上遵循了「統一管理層」的理念，特別是在與 Grafana 的整合上做得非常出色。

然而，我也識別出兩處關鍵的缺漏與一處架構原則的違反，這些問題會直接影響前端開發的進程和系統的長期可維護性。

本報告詳細記錄了這些問題，以及我已經實施的修復方案。所有變更均已同步更新至 `db_schema.sql`、`openapi.yaml` 及 `mock-server/server.js`，確保前後端契約的閉環。

---

## 2. 主要發現與修復方案

### 2.1 【高優先級】缺少平台核心設定契約

- **問題描述**:
  `specs.md` 中明確定義了「身份驗證」(OIDC) 和「郵件設定」(SMTP) 的前端管理頁面，但 `openapi.yaml` 和 `db_schema.sql` 中完全缺少對應的 API 端點和資料儲存結構。這是一個重大的契約缺口，導致前端無法實現這兩項關鍵的平台設定功能。

- **影響分析**:
  - **前端開發受阻**: 設定頁面無法進行開發，因為沒有對應的 API 可以呼叫。
  - **後端配置僵化**: 平台管理員無法透過 UI 動態調整 OIDC 或 SMTP 設定，所有配置只能依賴環境變數或設定檔，缺乏靈活性。
  - **安全風險**: 若將 OIDC client secret 等敏感資訊寫死在程式碼或一般設定檔中，會帶來安全隱患。

- **修復方案**:
  1.  **資料庫層面 (`db_schema.sql`)**:
      - 新增了一個名為 `system_settings` 的資料表。
      - 該表採用 `key-value` 結構，`key` 為設定項的唯一識別碼 (如 `oidc.client_secret`)，`value` 儲存 JSONB 格式的設定值。
      - 增加了一個 `sensitive` 欄位，用以標記該設定是否為敏感資訊，確保敏感值（如密碼、密鑰）不會在常規 API 請求中被洩漏。

  2.  **API 層面 (`openapi.yaml`)**:
      - 新增了 `GET /settings/configurations` 端點，用於獲取所有**非敏感**的系統設定，供前端頁面顯示。
      - 新增了 `PUT /settings/configurations` 端點，用於批次更新系統設定。請求的 body 中可以包含敏感資訊，但在回應中會將其過濾。

  3.  **模擬伺服器層面 (`mock-server/server.js`)**:
      - 實作了上述兩個新的 API 端點，確保回傳的結構與 `openapi.yaml` 中定義的 Schema 一致，且敏感資訊有被正確過濾。

### 2.2 【高優先級】核心資源表未實現軟刪除 (Soft Deletes)

- **問題描述**:
  `architecture.md` 中的設計決策 #10 明確指出，核心資源表（如 `users`, `teams`, `resources`）應採用軟刪除機制 (`deleted_at` 欄位)。然而，在原有的 `db_schema.sql` 中，這些資料表均未實現此機制。

- **影響分析**:
  - **資料完整性受損**: 硬刪除 (Hard Delete) 會導致與該資源相關的歷史紀錄（如審計日誌、事件指派歷史）因外鍵級聯刪除而丟失，這對於一個需要嚴格審計的 SRE 平台是不可接受的。
  - **資料恢復困難**: 一旦發生誤刪除，將無法快速恢復資料，增加了維運風險。
  - **違反架構原則**: 未遵循已制定的架構決策，破壞了系統設計的一致性。

- **修復方案**:
  1.  **資料庫層面 (`db_schema.sql`)**:
      - 我為以下所有核心資源表統一新增了 `deleted_at TIMESTAMPTZ` 欄位：
        - `users`, `teams`, `roles`
        - `resources`, `resource_groups`
        - `automation_scripts`, `automation_schedules`
        - `dashboards`
        - `notification_channels`, `notification_strategies`

  2.  **API 層面 (`openapi.yaml`)**:
      - 在所有受影響資源的 `GET` 列表端點中，新增了一個查詢參數 `include_deleted` (布林值，預設為 `false`)，使 API 調用者可以選擇是否要包含已被軟刪除的資料。
      - 在所有對應資源的 `DELETE` 端點的 `description` 中，明確註記此操作為**軟刪除**，而非永久刪除。

  3.  **模擬伺服器層面 (`mock-server/server.js`)**:
      - 修改了所有受影響資源的 `DELETE` 端點模擬邏輯，使其在接收到請求時，為對應的資料項設置 `deleted_at` 時間戳，而不是從陣列中移除。
      - 修改了 `GET` 列表和單一資源的端點，使其能夠處理 `include_deleted` 參數，並正確過濾已軟刪除的資料。

---

## 3. 其他觀察與建議

- **契約註解清晰**: `db_schema.sql` 和 `openapi.yaml` 中的註解非常清晰，尤其是在解釋為何不建立 `event_rules` 表，而是採用擴充屬性表 (`alert_rule_extensions`) 的部分，這極大地幫助了我理解其設計意圖。建議繼續保持這種良好的文檔習慣。
- **一致性高**: 除了上述兩個主要問題外，API 契約與前端規格書 (`specs.md`) 的一致性非常高，絕大部分的 UI 元件和操作流程都有對應的 API 支援。

---

## 4. 總結

本次契約審查與修復工作已經完成。修復後的 `db_schema.sql` 和 `openapi.yaml` 補齊了缺失的功能，並修正了與架構原則不符的設計。`mock-server` 也已同步更新，能夠為前端提供一個完整且一致的模擬開發環境。

現在，後端契約已經準備就緒，可以完整支撐前端所有功能的開發。
