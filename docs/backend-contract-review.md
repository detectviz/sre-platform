# 後端契約審查報告 (Backend Contract Review)

## 1. 文件閱讀摘要 (Document Review Summary)
- 依據架構文件確認平台分層設計與業務模組邊界，重點為事件、資源、通知與自動化服務的協同運作。 【F:architecture.md†L106-L133】
- 核對前端規格書中對事件與通知模組的互動需求，特別是統一搜索篩選與通知歷史清理按鈕等核心操作。 【F:specs.md†L240-L340】【F:specs.md†L1728-L1779】

## 2. API 契約檢查 (API Contract Audit)
### 2.1 通知歷史 (Notification History)
- 規格要求通知歷史具備多條件篩選與清理舊資料功能；原契約僅提供狀態參數。已補強分頁排序、管道/策略/事件篩選、關鍵字搜尋與錯誤與可重發旗標參數。 【F:openapi.yaml†L3205-L3273】
- 新增 `/notification/history/purge` 端點，支援依時間、狀態、管道與策略批次清除紀錄，符合 UI 的「清理記錄」需求。 【F:openapi.yaml†L3336-L3360】【F:openapi.yaml†L6713-L6758】

### 2.2 通知策略 (Notification Strategy)
- 規格指出列表需依名稱、管道、接收者與優先級檢索。已擴充查詢參數以支援狀態、優先級、管道類型/ID、嚴重度與接收者類型，並加入排序控制。 【F:specs.md†L1598-L1645】【F:openapi.yaml†L2892-L2955】

### 2.3 其他核心模組 (Other Core Modules)
- 事件列表契約原生涵蓋狀態、嚴重度、資源、時間區間與標籤等條件，與規格需求一致，無須調整。 【F:specs.md†L240-L340】【F:openapi.yaml†L568-L639】
- 其餘資源管理、自動化與身份模組均已提供分頁與主要篩選參數，本次未檢出缺口。

## 3. 資料庫結構檢查 (Database Schema Audit)
- 為支援新增的通知歷史與策略查詢條件，補充 channel_type、channel_id、strategy、event 等索引，以及策略優先級、接收者與管道索引以優化查詢。 【F:db_schema.sql†L753-L829】
- 既有表結構已涵蓋通知歷史的重試資訊與關聯事件欄位，與 API 契約保持一致。 【F:db_schema.sql†L775-L808】

## 4. Mock Server 驗證 (Mock Server Validation)
- 擴充種子資料，使通知歷史含多種管道與狀態案例，並於摘要映射回傳 `channel_id` 與 `related_event_id`。 【F:mock-server/server.js†L887-L998】【F:mock-server/server.js†L1488-L1509】
- `GET /notification/history` 現可處理多種篩選與關鍵字；新增 `POST /notification/history/purge` 用於模擬批次清理，回應刪除統計。 【F:mock-server/server.js†L3707-L3836】
- 通知策略列表的 Mock 亦支援優先級、管道與接收者篩選，以確保前端可直接驗證新契約。 【F:mock-server/server.js†L3511-L3579】

## 5. 建議與後續工作 (Recommendations)
- 建議後端實作遵循新增索引與查詢參數，並補充端到端測試驗證清理操作與多條件篩選邏輯。
- 前端整合時可利用新增的 mock 資料覆蓋成功與失敗案例，確保錯誤提示與重新發送流程一致。
