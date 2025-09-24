# SRE Platform 後端契約檢查報告

**報告日期:** 2025-09-24
**審核者:** Jules (資深前端開發者)

## 1. 總結

本次檢查旨在確保 SRE Platform 的後端契約 (`openapi.yaml`, `db_schema.sql`) 能夠完整、準確地支援前端所有功能開發。在仔細審閱核心文件 (`architecture.md`, `specs.md`) 後，我對現有的契約進行了深入分析，並找出了幾處需要補強的缺漏與不一致之處。

所有發現的問題均已修正，相關檔案 (`openapi.yaml`, `db_schema.sql`, `mock-server/server.js`) 皆已更新。目前的後端契約與 Mock 伺服器已能滿足前端開發的全部需求，形成了一個閉環的開發環境。

---

## 2. 核心文件分析摘要

- **`architecture.md`**:
    - **核心原則**: 平台作為 Grafana 與 Keycloak 之上的「統一管理層」，專注於提供 **週期性靜音規則 (Recurring Silence Rules)**、**標籤治理 (Tag Governance)** 與 **智慧告警處理 (Intelligent Alert Processing)** 等獨特價值，避免與底層系統功能重疊。
    - **設計約束**: 明確禁止建立如 `event_rules` 或 `auth_settings` 等與 Grafana/Keycloak 功能重複的資料表，強調 **單一事實來源 (Single Source of Truth)** 原則。

- **`specs.md`**:
    - **功能需求**: 文件詳細定義了各頁面 (儀表板、事件、資源、設定等) 所需的 UI 元件、資料欄位與互動行為。這份文件是本次契約檢查最主要的驗證依據。

---

## 3. 檢查發現與修正方案

以下條列本次檢查發現的具體問題、潛在影響以及對應的修正方案。

### 問題 1: `dashboards` 資料表存在冗餘欄位

- **檔案**: `db_schema.sql`
- **問題描述**: `dashboards` 資料表中存在 `is_default` 欄位，這與 `user_preferences` 中定義的 `default_landing` (使用者預設登入頁) 功能重疊，違反了「單一事實來源」的架構原則。
- **潛在影響**:
    - 資料不一致：可能導致系統層級的預設儀表板與使用者個人設定的預設儀表板產生衝突。
    - 增加前端邏輯複雜度：前端需要處理兩種不同的「預設」狀態，增加了判斷邏輯。
- **修正方案**:
    - **[已完成]** 從 `db_schema.sql` 的 `dashboards` 資料表定義中，**移除 `is_default` 欄位**。所有預設儀表板的邏輯統一由 `user_preferences` 控制。

### 問題 2: 使用者邀請功能缺乏團隊與角色指派能力

- **檔案**: `db_schema.sql`, `openapi.yaml`, `mock-server/server.js`
- **問題描述**: 根據 `specs.md`，管理者在邀請新成員時，應能直接為其指派所屬團隊與角色。然而，現有的 API (`POST /iam/invitations`) 與資料庫 (`user_invitations` table) 均未支援此功能。
- **潛在影響**:
    - 流程中斷：管理者邀請後，還需等待使用者接受，才能在另一個介面手動指派團隊與角色，操作流程不順暢。
    - 權限管理延遲：新使用者加入時無法立即獲得正確權限，影響其第一時間參與工作的能力。
- **修正方案**:
    - **[已完成]** **擴充 `user_invitations` 資料表**: 在 `db_schema.sql` 中新增 `team_ids UUID[]` 與 `role_ids UUID[]` 欄位。
    - **[已完成]** **更新 API Schema**: 在 `openapi.yaml` 中，為 `CreateIAMInvitationRequest` schema 新增 `team_ids` 和 `role_ids` 兩個可選陣列欄位。
    - **[已完成]** **更新 Mock Server**: 調整 `mock-server/server.js`，確保 `POST /iam/invitations` 端點能正確接收並在回應中模擬 `team_ids` 和 `role_ids`。

### 問題 3: `LayoutWidgetDefinition` Schema 缺少說明欄位

- **檔案**: `openapi.yaml`
- **問題描述**: `db_schema.sql` 的 `layout_widgets` 資料表中已有名為 `description` 的欄位，但在 `openapi.yaml` 對應的 `LayoutWidgetDefinition` schema 中卻遺漏了此欄位。
- **潛在影響**:
    - 前端資訊展示不全：前端無法獲取並向使用者展示每個可選 Widget 的詳細說明，影響使用者體驗。
- **修正方案**:
    - **[已完成]** 在 `openapi.yaml` 的 `LayoutWidgetDefinition` schema 中，**補上 `description` 欄位**。
    - **[已驗證]** `mock-server/server.js` 中對應的 mock data (`layoutWidgets`) 已包含此欄位，無需修改。

### 問題 4: 儀表板總覽 API 未提供活躍使用者數據

- **檔案**: `openapi.yaml`, `mock-server/server.js`
- **問題描述**: `specs.md` 中「儀表板列表頁」的 KPI 卡片區塊，明確要求顯示「活躍使用者」數量。然而，`GET /dashboards/summary` 端點的回應 schema (`DashboardSummaryMetrics`) 中並未包含此欄位。
- **潛在影響**:
    - 前端無法實作核心指標：儀表板總覽頁缺少一個重要的 KPI 指標，功能不完整。
- **修正方案**:
    - **[已完成]** **更新 API Schema**: 在 `openapi.yaml` 的 `DashboardSummaryMetrics` schema 內的 `totals` 物件裡，**新增 `active_users` 欄位** (型別為 integer)。
    - **[已完成]** **更新 Mock Server**: 調整 `mock-server/server.js`，修改 `GET /dashboards/summary` 的處理邏輯，確保其回應的 JSON 資料包含 `active_users` 欄位並提供模擬數值。

---

## 4. Mock Server 驗證

所有 API 端點皆已透過 `mock-server/server.js` 進行實作或更新，並確認以下事項：
- 所有 API 路徑、方法與 `openapi.yaml` 定義一致。
- Request/Response 的 JSON 結構與 `openapi.yaml` schema 完全匹配。
- Mock Server 可正常啟動，所有已實作的端點均能成功訪問並回傳正確的模擬資料。
- 已能完整支援 `specs.md` 中描述的前端功能開發需求。

## 5. 結論

經過本次全面的檢查與修正，SRE Platform 的後端契約與 Mock 環境已達到高度一致與完整。前端團隊現在可以依據 `openapi.yaml` 與 `mock-server` 進行順暢、無阻礙的開發。建議後續任何契約變更，皆需同步更新所有相關檔案，以維持開發環境的閉環與高效。
