## Summary

- 容量規劃分頁在資料載入時直接回傳 null，造成畫面短暫全空且缺乏載入指示，違反 G-4 所需的 loading 體驗。

- 設定總覽頁面未使用共享的 PageHeader，改以手刻 Title/Paragraph 呈現，導致頁首間距與麵包屑行為與其他頁面不一致。

- 身份與存取管理頁面中的刪除確認對話框呼叫未定義的 api.delete*，操作時會觸發 ReferenceError 而失敗。

## Issues

1. 容量規劃頁籤在 loading 狀態時沒有任何回饋，使用者會看到空白畫面，不符稽核清單要求的載入指示。(`frontend/src/pages/AnalyzingPage.tsx` 50-62 行)

步驟：

	1. 編輯 `frontend/src/pages/AnalyzingPage.tsx` 中 `CapacityPlanningContent` 的 `renderContent`，在 `loading` 為 `true` 時回傳 `<Spin>` 或 `<Skeleton>` 容器，而非 `null`。
	2. 確保載入指示置中顯示並與現有內容的 `Space` 排版協調（可使用 `div` 包裹設定 `display: flex` 與 `justifyContent: center`）。
	3. 手動切換 `useCapacityPlanning` 的載入狀態或模擬慢速 API，確認載入期間畫面維持一致的視覺回饋。

2. /settings 首頁沒有沿用 PageHeader，造成頁首樣式與其餘分頁不同，違反 UI 統一性與 prototype.html 定義的佈局邏輯。(`frontend/src/pages/SettingsPage.tsx` 8-159 行)

步驟：
	1. 在 `frontend/src/pages/SettingsPage.tsx` 引入並使用 `PageHeader`，提供標題、敘述與必要的操作列，取代目前的 `<Title>`/`<Paragraph>` 區塊。
	2. 透過 `PageHeader` 的 `className` 或周邊 `Space` 元件，調整後續卡片列表與頁首的間距，保持與其他分頁一致的 24px 標準間距。
	3. 於開發伺服器上檢視設定首頁，核對麵包屑、標題與操作列與 `prototype.html` 所示一致。


3. IAM 刪除人員／團隊／角色時調用未宣告的 api 物件，使用者一旦確認刪除就會遭遇 JavaScript 例外並中斷操作。(`frontend/src/pages/UserPermissionsPage.tsx` 120-193 行)

步驟：
	1. 在 `frontend/src/pages/UserPermissionsPage.tsx` 開頭匯入 `api` 服務（`import api from '../services/api';`），移除 `// @ts-ignore`。
	2. 若 `services/api.ts` 的 `realApi` 尚未實作 `deleteUser`/`deleteTeam`/`deleteRole`，補上對應的 HTTP 呼叫以避免切換真實 API 時出錯。
	3. 手動觸發刪除確認流程，確保操作後能成功顯示成功／失敗訊息且不再丟出 `ReferenceError`。


