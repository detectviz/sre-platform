# SRE 平台後端契約審查與精簡報告

**版本**: 1.0
**日期**: 2025-09-24
**審查人**: Jules (資深系統架構師)

## 1. 摘要

本報告旨在對 SRE 平台的後端契約（包含 API 契約與資料庫結構）進行全面性檢查與精簡。基於對 `specs.md`、`architecture.md`、`openapi.yaml` 和 `db_schema.sql` 的詳細分析，我們識別出多個潛在的冗餘、不一致與違反架構原則之處。

本報告將分為兩部分：首先列出所有發現的「問題清單」，然後針對每個問題提出具體的「修正建議」，以作為下一階段實作的藍圖。

---

## 2. 問題清單 (Problem List)

### 2.1. 資料庫層級問題 (Database Layer Issues)

#### 2.1.1. 功能與架構原則不符的資料表
根據 `architecture.md` 和 `AGENT.md` 的指導原則，平台應將身份認證完全委託給 Keycloak。以下資料表的功能與此原則衝突：
*   **`user_invitations`**: 使用者邀請流程應由 Keycloak 管理，此表存在造成了職責重疊。
*   **`security_login_history`**: 登入歷史與安全審計應由 Keycloak 負責，平台內不應重複儲存。

#### 2.1.2. 潛在的冗餘資料表
*   **`resource_group_subscribers`**: 此表的功能與 `team_subscribers` 高度相似，但模型更為簡化（僅支援使用者訂閱）。這導致系統中存在兩套不統一的訂閱者模型，增加了理解與維護的複雜度。

#### 2.1.3. 欄位命名不一致
*   **擁有者/建立者欄位**: 在不同資料表中，表示「建立者」或「擁有者」的欄位命名混亂，例如：
    *   `teams.owner_id`
    *   `automation_scripts.created_by`
    *   `notification_channels.created_by`
    *   `dashboards.owner_id`
    這使得跨表查詢和理解資料模型變得困難。

### 2.2. API 與資料庫不一致問題 (API vs. Database Inconsistencies)

#### 2.2.1. 概念命名不一致
*   **事件規則 vs. 告警規則擴充**: API 層級使用 `/event-rules` 來管理告警規則，但其對應的資料庫表格卻是 `alert_rule_extensions`。雖然這種抽象可能是為了前端體驗，但它造成了 API 契約與底層實現之間的概念斷層。

### 2.3. 規格文件與契約不一致問題 (Specifications vs. Contract Inconsistencies)

#### 2.3.1. 時間戳欄位命名不匹配
*   **`trigger_time` vs. `triggered_at`**: UI 規格文件 `specs.md` 在多處（如事件列表）使用 `trigger_time` 來描述「觸發時間」。然而，在 `openapi.yaml` 和 `db_schema.sql` 中，對應的欄位均為 `triggered_at`。這導致前端開發規格與後端契約不一致。

---

## 3. 修正建議 (Correction Suggestions)

### 3.1. 資料庫層級修正 (Database Layer Corrections)

#### 3.1.1. **【建議】** 刪除已棄用的資料表
*   **操作**: 從 `db_schema.sql` 中 **刪除** `user_invitations` 和 `security_login_history` 兩張資料表及其所有關聯。
*   **理由**: 嚴格遵守「統一管理層」的架構原則，將身份認證相關功能完全交由 Keycloak 處理。這能顯著簡化平台架構，降低安全風險與維護成本。

#### 3.1.2. **【建議】** 合併訂閱者模型
*   **操作**: 從 `db_schema.sql` 中 **移除** `resource_group_subscribers` 資料表。
*   **理由**: 將資源群組的通知邏輯統一到其「負責團隊」上。當需要通知時，系統應查找資源群組的負責團隊，並利用 `team_subscribers` 的通知機制進行分發。這樣可以統一訂閱者模型，消除冗餘。

#### 3.1.3. **【建議】** 統一擁有者/建立者欄位命名
*   **操作**: 將所有資料表中表示「建立者」或「擁有者」的欄位統一命名為 `creator_id`。受影響的表格包括 `teams`, `automation_scripts`, `dashboards` 等。
*   **理由**: 提升資料庫 Schema 的一致性、可讀性與可維護性。`creator_id` 比 `owner_id` 或 `created_by` 更能精確地表達「創建此紀錄的使用者」的含義。

### 3.2. 跨層級一致性修正 (Cross-Layer Consistency Corrections)

#### 3.2.1. **【建議】** 統一事件規則的命名
*   **操作**: 雖然 API 與 DB 命名不一致，但考慮到改動 API 的影響範圍較大，建議 **維持現狀**，即 API 使用 `/event-rules`，資料庫使用 `alert_rule_extensions`。
*   **理由**: `alert_rule_extensions` 精確描述了其技術實現。API 的命名是為了前端體驗的合理抽象。我們應在 `openapi.yaml` 的 `description` 中明確註記此對應關係，以消除開發者的困惑，而非進行破壞性修改。

#### 3.2.2. **【建議】** 修正 UI 規格文件
*   **操作**: 更新 `specs.md` 文件，將所有 `trigger_time` 的實例修正為 `triggered_at`。
*   **理由**: 確保作為 SSOT (Single Source of Truth) 的一部分的 UI 規格文件，與後端契約（API 和 DB）保持完全一致，避免前端在開發時產生誤解。

---
### 4. 總結
以上問題清單與修正建議旨在精簡系統架構、消除冗餘、提高一致性。建議團隊審閱此報告，並在達成共識後，按照此計畫進入下一階段的實作。