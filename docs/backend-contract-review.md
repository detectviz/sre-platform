# 後端契約檢查報告 Backend Contract Review

## 檢查摘要 Summary
- 完成對 `openapi.yaml`、`db_schema.sql` 與 `mock-server/server.js` 的交叉檢查，聚焦在身份與存取管理模組的邀請流程與人員資料欄位。
- 針對發現的契約落差（缺少邀請列表 API、使用者欄位命名不一致、資料庫外鍵約束衝突）提出並落實修正方案。
- 新增邀請查詢 API 及索引支援前端分頁、排序需求，並同步更新 Mock Server 以供前端立即驗證。

## 詳細發現 Detailed Findings
1. **缺少邀請列表 API**  
   - **文件來源**：`specs.md` 第 7.1 節指出需要顯示「待處理邀請」等統計資料，但 `openapi.yaml` 僅提供 `POST /iam/invitations`。  
   - **風險**：前端無法載入邀請清單與統計卡片，影響 IAM 介面。  
   - **修正**：新增 `GET /iam/invitations`，支援狀態篩選、關鍵字搜尋與排序。  

2. **使用者顯示名稱欄位不一致**  
   - **文件來源**：`db_schema.sql` 使用 `display_name`，而 `openapi.yaml` 的 `IAMUserSummary` 僅定義 `name`。  
   - **風險**：後端回傳欄位與前端型別不符，導致 UI 顯示錯誤。  
   - **修正**：將 `openapi.yaml` 內的 `IAMUserSummary` 調整為 `display_name`，並同步更新 Mock Server 回傳欄位。  

3. **自動化執行歷史外鍵約束不一致**  
   - **文件來源**：`db_schema.sql` 將 `automation_executions.script_id` 設為 `NOT NULL`，但同時宣告 `ON DELETE SET NULL`。  
   - **風險**：當腳本被刪除時資料庫會嘗試寫入 NULL 造成約束衝突，歷史資料無法保留。  
   - **修正**：移除 `NOT NULL` 約束，允許保留歷史紀錄並在 API schema 中將 `script_id` 標記為可為空值。  

## 資料庫調整 Database Adjustments
- `automation_executions.script_id` 移除 `NOT NULL`，確保 `ON DELETE SET NULL` 能正常運作。
- `user_invitations` 新增 `invited_at`、`last_sent_at`、`expires_at` 索引，支援前端常用排序。

## API 契約調整 API Contract Updates
- 新增 `GET /iam/invitations` 端點與對應查詢參數說明。
- `IAMInvitationResponse` 擴充欄位：`invited_by`、`invited_by_name`、`invited_at`、`expires_at`、`accepted_at`、`last_sent_at`。
- `IAMUserSummary` 以 `display_name` 取代 `name`，避免欄位對應錯誤。

## Mock Server 驗證 Mock Server Validation
- 補上邀請列表資料與 API 實作，支援分頁、篩選與排序。
- 確保 `POST /iam/invitations` 回傳最新欄位並維持資料一致性。
- 語法驗證：`node --check mock-server/server.js`。

## 後續建議 Next Steps
- 於前端整合 `GET /iam/invitations` 以實作待處理邀請小工具與列表頁。
- 為邀請 API 補強重新發送／取消等操作（若前端有需求）。
- 監控 `automation_executions` 與 `user_invitations` 查詢效能，視實際資料量調整索引策略。
