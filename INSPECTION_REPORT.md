# SRE 平台後端契約檢查報告

**報告日期**: 2025-09-24
**檢查者**: Jules (資深前端開發者)

## 1. 總體結論

經過對核心文件 (`architecture.md`, `specs.md`, `AGENT.md`)、API 契約 (`openapi.yaml`) 與資料庫結構 (`db_schema.sql`) 的全面交叉比對，**本人評估後端契約的整體健康狀況極佳**。

API 與資料庫的設計充分、一致且符合架構原則，能夠為前端提供一個穩固的開發基礎。目前發現的主要改進點在於 `mock-server` 的實作，其對複雜查詢的支援尚不完整。

## 2. 詳細檢查項目

### 2.1. 核心文件與架構原則
- **評價**: **高度符合**
- **說明**: `openapi.yaml` 和 `db_schema.sql` 的設計嚴格遵守了 `AGENT.md` 和 `architecture.md` 中定義的系統邊界原則。
  - **職責分離**: 告警規則管理正確地委託給 Grafana，身分驗證委託給 Keycloak。資料庫中未發現如 `event_rules` 或 `auth_settings` 等違反邊界的資料表。
  - **增值功能**: 資料庫包含了 `silence_rules`, `notification_history`, `tag_definitions` 等平台增值功能的資料表，與架構定位相符。
  - **設計規範**: 資料庫普遍採用了軟刪除 (`deleted_at`) 機制，符合架構決策。

### 2.2. `openapi.yaml` 完整性檢查
- **評價**: **非常完整**
- **說明**: API 契約 (`openapi.yaml`) 完整覆蓋了 `specs.md` 中描述的所有核心功能模組，包括事件管理、資源管理、儀表板、自動化及各項設定。
  - **端點覆蓋**: 所有前端頁面所需的核心操作（CRUD）均有對應的 API 端點。
  - **Schema 一致性**: Request/Response 的 Schema 設計詳細，欄位能滿足 `specs.md` 中定義的 UI 顯示與表單提交需求。例如，儀表板列表的 `dashboard_type` 與 `grafana_url` 欄位，以及事件規則的 `automation` 物件，都與前端需求精準對應。
  - **參數標準化**: 分頁 (`page`, `page_size`) 與排序 (`sort_by`, `sort_order`) 參數統一，符合開發規範。

### 2.3. `db_schema.sql` 正確性檢查
- **評價**: **結構良好**
- **說明**: 資料庫結構 (`db_schema.sql`) 與 `openapi.yaml` 的資料模型高度一致，能夠支撐 API 層的資料存取需求。
  - **欄位對應**: API Schema 中的欄位都能在資料庫中找到對應的欄位與型別。
  - **關聯正確**: 如 `users`, `teams`, `roles` 之間的主外鍵關聯設計清晰、正確。
  - **規範遵循**: 資料表命名、欄位型別及約束（Constraints）均符合專案規範。

### 2.4. `mock-server` 支援度檢查
- **評價**: **有待加強**
- **主要問題**: Mock Server (`mock-server/server.js`) 雖然實現了大部分 API 端點的基本路徑，但**對於複雜查詢參數的支援嚴重不足**。
  - **篩選功能缺失**: `GET /events`, `GET /resources`, `GET /notification-config/history` 等列表端點在 `openapi.yaml` 中定義了豐富的篩選參數（如 `status`, `severity`, `type`, `keyword` 等），但 Mock Server 並未實作相應的篩選邏輯，導致回傳的永遠是所有資料。
  - **排序功能缺失**: `sort_by` 和 `sort_order` 參數未被處理。
- **影響**: 這會嚴重影響前端開發效率，開發人員無法在本地模擬真實的篩選、排序與搜尋場景，難以進行完整的 UI 功能測試。

## 3. 結論與建議方案

後端契約本身無需修改。當前的首要任務是**強化 Mock Server**，使其行為與 `openapi.yaml` 的定義完全對齊。

**建議修正方案**:
1.  **盤點缺漏**: 全面性地比對 `openapi.yaml` 與 `mock-server/server.js`，列出所有未被實作的查詢參數。
2.  **實作篩選與排序邏輯**: 在 `mock-server/server.js` 中為各個列表 API (`GET /...`) 增加處理篩選、排序與關鍵字搜尋的程式碼。
3.  **驗證**: 確保更新後的 Mock Server 能夠正確回應帶有複雜查詢參數的請求。

完成上述修正後，即可為前端團隊提供一個可信賴、能完整支援開發需求的閉環測試環境。
