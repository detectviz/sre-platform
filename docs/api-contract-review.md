# API 契約檢查報告 (API Contract Review Report)

## 📋 檢查概覽 (Overview)
- 檢視 architecture.md、specs.md 確認事件、通知、資源與自動化模組需求與資料流。
- 針對 db_schema.sql、openapi.yaml 與 mock-server/server.js 進行交叉比對，確保欄位、枚舉與模擬資料一致。
- 補齊事件來源分類、通知策略註解等架構澄清項目，維持與「統一管理層 + 開源執行引擎」策略一致。

## 🔍 核心發現 (Key Findings)
- 事件模組需明確標註 Grafana 與平台的分工，並於快取表格補齊建立者與最後更新時間以支援離線回填。
- 通知策略與通道屬於平台增值功能，資料表已補強註解與索引並新增 CSV 匯出 API 參數，維持與規格一致。
- 事件與靜音、通知策略列表需支援 `format=csv` 參數匯出資料，並在 Mock Server 中同步提供對應回應。

## 🧾 契約更新摘要 (Contract Updates)

### 資料庫 (Database Schema)
- `events` 表新增 `event_source` 欄位、檢查約束與複合索引，並撰寫表格註解說明增值定位。
- `event_relations`、`event_ai_analysis` 新增註解，補強根因分析與關聯追蹤的設計目的。
- `notification_channels`、`notification_strategies` 新增註解與複合索引，突顯平台特有通知策略與查詢需求。
- `audit_logs` 表新增用途註解與 `cleanup_old_audit_logs` 保留策略函式，落實審查報告建議的日誌治理機制。
- `event_rule_snapshots` 表快取 Grafana 規則 JSON 與同步狀態，並補充 `cached_creator`、`cached_last_updated`、`created_at` 欄位與可為空的 `last_synced_at`，確保離線模式仍能提供建立者與更新時間。

### API 契約 (OpenAPI Specification)
- `EventSummary`、`CreateEventRequest`、`UpdateEventRequest` 增加 `event_source` 枚舉欄位與說明，並補上 `source` 的語意描述。
- 調整事件回應的 required 欄位，確保前端可取得來源分類以支援 UI 標籤與篩選。
- `EventRuleSummary` 現在要求回傳 `creator` 與 `last_updated`，並補充欄位說明以對應快取欄位 `cached_creator`、`cached_last_updated`。
- `/event-rules`、`/silence-rules`、`/notification-config/strategies` GET 端點新增 `format=csv` 查詢參數與 `text/csv` 回應，支援規格中的匯出需求。

### 模擬服務 (Mock Server)
- 事件樣本資料補齊 `event_source` 與 `source` 欄位，並在建立事件時依據 rule_uid 自動推導來源。
- `mapEventSummary` 回傳結構同步 OpenAPI 契約，確保前端型別推導一致。
- 事件規則樣本補充 `sync_status`、`last_synced_at` 欄位，模擬快取回填情境。

### 前端型別 (Frontend Types)
- `Incident` 介面新增 `event_source` 與 `source`，支援 UI 顯示事件來源標籤。
- 新增 `EventRuleSummary`、`EventRuleDetail` 與 `EventRuleSyncStatus`，確保精靈可以判斷快取狀態並回填欄位。

## 🔎 詳細檢查結果 (Detailed Findings)

### 事件規則 (Event Rules)
| 檢查項目 | 一致性結論 | 重點說明 |
| --- | --- | --- |
| 資料庫 | ✅ 與需求相符 | `event_rule_snapshots` 補齊 `cached_creator`、`cached_last_updated`、`created_at` 與可為空的 `last_synced_at`，確保離線快取仍能提供必要欄位。|
| API 契約 | ✅ 與規格一致 | `EventRuleSummary` 新增必填的 `creator`、`last_updated` 說明，`/event-rules` GET 支援 `format=csv` 匯出。|
| Mock Server | ✅ 已覆蓋 | `/event-rules` 路由支援 CSV 匯出並回傳逗號分隔欄位，示例資料同步帶入新欄位。|

### 靜音規則 (Silence Rules)
| 檢查項目 | 一致性結論 | 重點說明 |
| --- | --- | --- |
| 資料庫 | ✅ 與需求相符 | `silence_rules`/`silence_rule_matchers` 欄位覆蓋排程、範圍與通知選項，無需額外調整。|
| API 契約 | ✅ 與規格一致 | `/silence-rules` GET 新增 `format=csv`，欄位枚舉與資料表約束一致。|
| Mock Server | ✅ 已覆蓋 | CSV 匯出列出開始／結束時間、時區與重複頻率欄位，與 UI 需求相符。|

### 通知策略 (Notification Strategies)
| 檢查項目 | 一致性結論 | 重點說明 |
| --- | --- | --- |
| 資料庫 | ✅ 與需求相符 | `notification_strategies`、`notification_channel_links` 等表提供重試、靜音、通道綁定欄位，符合 specs.md。|
| API 契約 | ✅ 與規格一致 | `/notification-config/strategies` GET 支援 `format=csv`，新增說明確保匯出資料集成。|
| Mock Server | ✅ 已覆蓋 | 匯出資料包含啟用狀態、優先級、通道數量與靜音關聯，滿足前端測試需求。|

## ✅ 驗證步驟 (Validation Steps)
1. 重新檢查 openapi.yaml 與 db_schema.sql 欄位與約束一致性。
2. 更新 mock-server 後啟動服務，確認事件清單端點回傳新欄位。
3. 檢視 frontend 型別定義與模擬資料的欄位一致性。

## 📌 待續工作建議 (Next Recommendations)
- 為通知策略與事件來源新增前端標籤樣式，強化使用者辨識度。
- 針對 `event_source` 補充測試案例，確保未來整合 Grafana Webhook 時能正確映射。
