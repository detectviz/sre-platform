# TODO / 驗收清單（對齊 specs.md 與 openapi.yaml）

更新時間：2025-09-08 07:47 UTC

本清單為可驗收的工作分解，對應 specs.md 的章節與 openapi.yaml 的端點，供研發與測試依序完成。

---

## A. 全局與基礎
- [ ] 認證雙軌（正式 OIDC／開發本地帳密）落地：登入、登出、token refresh、401 攔截、路由守衛（對應 specs 4.x；/api/v1/auth/* 僅開發模式）
- [ ] API 客戶端生成並可用（openapi-typescript 或 codegen），整合標準錯誤處理與型別
- [ ] 列表端點分頁/排序一致（page/page_size/sort_by/sort_order）並於 UI 值綁定
- [ ] 標準錯誤回應與 i18n 對照（specs 19.x 與 openapi x-error-codes）
- [ ] 動作端點 OperationResult 一致使用與處理（已於多數端點實裝）
- [ ] 即時更新：SSE（GET /api/v1/events）自動重連＋退避＋lastEventId 續傳；WS 作為替代（x-websocket）
- [ ] 資源健康規則：依資源類型（server/database/network/application/container）使用 x-resource-status-rules 呈現狀態
- [ ] 搜尋與自動完成：GET /api/v1/search、GET /api/v1/autocomplete（type=all）

---

## B. 功能模組驗收

### B1. 儀表板（specs 5；API /dashboard/*）
- [ ] 摘要、趨勢、分佈圖與例子資料渲染（空/錯/載入三態）

### B2. 資源（specs 6；API /resources/*）
- [ ] 列表/詳情（分頁/排序/篩選）
- [ ] 歷史指標圖（/resources/{id}/metrics）
- [ ] 批次操作：delete / move_group / tag_add / tag_remove（BatchOperationResult 顯示逐項結果）
- [ ] 網段掃描（/resources/scan 與 /resources/scan/{taskId}）

### B3. 資源群組（specs 17；API /resource-groups/*）
- [ ] 列表/詳情/CRUD
- [ ] 成員維護（/resource-groups/{groupId}/members）

### B4. 告警事件（specs 11；API /incidents/*, /alerts）
- [ ] 列表/詳情（/incidents, /incidents/{id}）
- [ ] 確認/解決/指派/註記（acknowledge/resolve/assign/comments）
- [ ] 關聯事件（/incidents/{id}/correlated）
- [ ] 告警列表（/alerts）具備分頁排序與 response-level example 驗證
- [ ] AI 事件報告（/incidents/generate-report）

### B5. 告警規則（specs 8；API /alert-rules/*）
- [ ] 列表/詳情/CRUD
- [ ] 啟用/停用（enable/disable）
- [ ] 測試規則（/alert-rules/{id}/test）

### B6. 自動化（specs 9；API /automation/*）
- [ ] 腳本列表/詳情/CRUD；手動執行（/scripts/{id}/run）
- [ ] 統一執行 API（/automation/execute）
- [ ] 執行歷史與詳情（/executions, /executions/{id}）
- [ ] 排程列表/詳情/CRUD（/schedules/*）

### B7. 使用者與團隊（specs 12；API /users/*, /teams/*）
- [ ] 使用者列表/詳情/CRUD
- [ ] 個人資料、變更密碼、通知偏好、聯絡方式驗證（/users/profile/*）
- [ ] 團隊列表/詳情/CRUD 與成員維護（/teams/{teamId}/members）

### B8. 通知與通知管道（specs 16；API /notification-*）
- [ ] 通知中心：列表與未讀摘要（依 specs 對應端點）
- [ ] 通知管道列表/詳情/CRUD；測試通道（/notification-channels/{id}/test）

### B9. 系統設定與審計（specs 13, 18）
- [ ] 系統設定讀寫（/settings）
- [ ] 審計日誌列表與詳情抽屜（/audit-logs）

### B10. 容量規劃（specs 10；API 對應）
- [ ] 視圖與資料渲染（空/錯/載入三態）
- [ ] 容量預測功能（/api/v1/capacity/forecast）
- [ ] 容量報告列表與詳情（/api/v1/capacity/reports/*）

### B11. 通知中心（specs 22；API /api/v1/notifications/*）
- [ ] 通知列表與未讀摘要（/api/v1/notifications, /api/v1/notifications/summary）
- [ ] 標記已讀功能（/api/v1/notifications/mark-all-as-read, /api/v1/notifications/{notificationId}/mark-as-read）

### B12. 角色管理（specs 25；API /api/v1/roles/*）
- [ ] 角色定義列表（/api/v1/roles GET）
- [ ] 自定義角色創建與更新（/api/v1/roles POST, /api/v1/roles/{roleName} PUT）

### B13. 平台診斷（specs 24；API /api/v1/admin/diagnostics）
- [ ] 平台健康狀態儀表板（/api/v1/admin/diagnostics）

---

## C. 錯誤與 UX
- [ ] 全局錯誤態、空態、載入態樣式一致（specs 15.x）
- [ ] ErrorResponse 與 i18n 映射（specs 19.x, x-error-codes）
- [ ] 批次操作部分成功的逐項反饋（BatchOperationResult）

---

## D. 非功能性（specs 15）
- [ ] 權限保護（x-roles 與前端 UX gating）
- [ ] 性能（列表分頁/虛擬卷動；圖表資料量控制）
- [ ] 可用性（a11y、鍵盤操作、焦點管理）
- [ ] 可觀測性（前端錯誤日誌、request_id 串接）

---

備註：
- 新增端點與欄位請同步更新 specs.md 與 openapi.yaml（含 response-level example、標準錯誤、x-roles）。
- SSE/WS 設計請以 SSE 為主，WS 僅在需要雙向互動時導入。