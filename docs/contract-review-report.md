# 契約檢查報告 Contract Review Report

## 1. 檢查概覽 Overview
- 參考 `docs/architecture.md`、`docs/specs.md` 與 `prototype.md` 建立事件管理、資源監控、儀表板、自動化、通知、設定等核心模組的 API 與資料模型清單。
- 逐一對照 `openapi.yaml` 與 `db_schema.sql`，確認定義覆蓋 UI 所需欄位並符合 RESTful 慣例、分頁與錯誤回傳規範。
- 實際啟動 `mock-server` 驗證 `/resources`、`/dashboards`、`/notification/*`、`/iam/*`、`/settings/*` 等端點的回應結構。

## 2. API 契約檢查結果 (openapi.yaml)
- **系統設定欄位不一致**：`SystemSettings` 以 `retention_policy` 物件表示保存天數，與資料庫的平坦欄位不符，亦缺少 `updated_by`。已改為 `retention_events_days`、`retention_logs_days`、`retention_metrics_days` 並標註 `updated_by`/`updated_at` 為唯讀欄位，同步更新 `/admin/settings` 的標籤分類為「平台設定」。
- **團隊詳細資料**：沿用 `TeamDetail` 結構，確保詳細端點回傳訂閱者物件陣列 (`TeamSubscriber`) 並保留 `subscriber_ids`，以支援列表與詳細檢視之間的欄位映射。

## 3. 資料庫結構檢查結果 (db_schema.sql)
- 已包含 `resource_batch_operations`、`resource_batch_results`、`resource_scan_tasks`、`resource_scan_results` 對應資源批次操作與掃描流程；欄位含狀態、統計、錯誤訊息，符合原型需求。
- `system_settings` 以平坦欄位存放維護模式、掃描限制與資料保留天數，對應更新後的 API 結構。
- 事件、通知、儀表板、團隊與標籤等核心資料表均提供主鍵、外鍵、索引與檢查約束，支援前端 UI 所需的篩選與狀態統計。

## 4. Mock Server 驗證結果 (mock-server/server.js)
- 修正 `/dashboards` 建立路由未把新儀表板寫回記憶體陣列的問題，現可透過 GET 取得新建儀表板。
- 新增 `buildTeamDetail` 工具，確保 `/iam/teams` 詳細與更新路由在處理物件化的 `subscribers` 時，同步維護 `subscriber_details`、`subscriber_ids` 與摘要所需的識別碼陣列。
- `/admin/settings` 現回傳平坦欄位並在更新時自動平坦化舊版 `retention_policy` 結構，同時補上 `updated_by` 與最新的 `updated_at`。

## 5. 測試與驗證 Testing
- 於 `mock-server/` 執行 `npm install` 取得依賴後啟動 `npm start`，透過 `curl` 針對 `/dashboards`、`/iam/teams`、`/admin/settings` 進行 CRUD 流程驗證，確保回應符合 `openapi.yaml` 契約。

## 6. 待辦與建議 Next Steps
- 後端實作時，需依據更新後的 `SystemSettings` 平坦欄位實作資料庫存取層，避免保留舊版 JSON 結構。
- 若未來需要從訂閱者 ID 自動補齊顯示名稱，可考慮在 mock server 與正式服務加入查詢邏輯以產生 `subscriber_details` 完整資訊。
