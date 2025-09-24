# SRE 平台後端契約審查與精簡報告

**版本**: 1.0
**日期**: 2025-09-24
**審查人**: Jules (資深系統架構師與資料建模專家)

## 1. 總體評價

SRE 平台的後端契約（`openapi.yaml`, `db_schema.sql`）整體架構清晰，特別是在遵循「統一管理層」與外部系統（Grafana, Keycloak）的邊界原則方面做得相當出色。資料庫設計考量了軟刪除、索引優化與平台增值功能，API 設計也大致遵循了 RESTful 風格。

本次審查的主要目標是進一步提升契約的 **一致性、精簡性與可維護性**。以下將詳細列出發現的問題點與具體的修正建議。

## 2. 問題清單與修正建議

### 2.1. 功能與路徑重複/冗餘

| 項目編號 | 發現問題 | 影響文件 | 修正建議 |
| :--- | :--- | :--- | :--- |
| **P-01** | API 中存在棄用的事件更新端點。 | `openapi.yaml` | **移除** `PATCH /events/{event_id}` 端點。該功能已被 `POST /events/{event_id}/actions` 取代，移除後可避免誤用並簡化契約。 |
| **P-02** | API 標籤 (tags) 中存在語義重疊。 | `openapi.yaml` | **統一標籤**：將 "通知中心" 的相關端點 (`/notifications/*`) 的標籤從 "通知中心" 改為 "通知管理"，使其與 `/notification-config/*` 的管理功能歸入同一分類。 |
| **P-03** | API 中存在一個疑似拼寫錯誤的路徑。 | `openapi.yaml` | **修正路徑**：`openapi.yaml` 中缺少 `/settings/tags/summary` 端點的定義。根據 `specs.md` 的需求，應新增此端點，而非保留一個無效的 `/tags/summary` 路徑。 |
| **P-04** | 資料庫中存在與 Keycloak 功能重疊的表。 | `db_schema.sql` | **標記為待移除**：`user_invitations` 和 `security_login_history` 兩個資料表的功能應由 Keycloak 處理。建議在 schema 中將其標記為棄用，並在後續版本中移除。對應的 API 端點 (`/iam/invitations`, `/me/security/logins`) 也應一併移除。 |

### 2.2. 欄位與 Schema 不一致

| 項目編號 | 發現問題 | 影響文件 | 修正建議 |
| :--- | :--- | :--- | :--- |
| **D-01** | 資料庫中時間戳欄位命名不一致。 | `db_schema.sql` | **統一命名**：將 `security_login_history` 中的 `login_time` 改為 `logged_in_at`；將 `events` 中的 `trigger_time` 改為 `triggered_at`。全局統一使用 `_at` 後綴。 |
| **A-01** | API 中建立者資訊的 Schema 不統一。 | `openapi.yaml` | **標準化 Schema**：在 `EventRuleSummary`, `AutomationScriptSummary` 等多個 schema 中，將 `creator: string` 或 `created_by: string` 欄位統一替換為 `$ref: '#/components/schemas/CreatorInfo'`。 |
| **A-02** | API 中使用者相關 Schema 命名不一致。 | `openapi.yaml` | **統一命名**：在 `UserProfile`, `IAMUserSummary`, `SecurityLoginRecord` 等 schema 中，將 `last_login` 或 `login_time` 統一為 `last_login_at`，與資料庫保持一致。 |
| **A-03** | API 與資料庫的偏好設定結構不匹配。 | `openapi.yaml`, `db_schema.sql` | **維持現狀，但需註解**：API 的 `UserPreference` schema 使用 `discriminator`，比資料庫的扁平結構更具表現力。此為良好設計，無需修改。建議在 `db_schema.sql` 中增加註解，說明其與 API schema 的對應關係。 |

### 2.3. 可精簡與優化之處

| 項目編號 | 發現問題 | 影響文件 | 修正建議 |
| :--- | :--- | :--- | :--- |
| **O-01** | 多個資料表存在重複的 `created_by`, `updated_by` 欄位。 | `db_schema.sql` | **維持現狀**：雖然這些欄位重複，但將其抽象化的成本較高，且目前設計清晰易懂。暫不建議修改。 |
| **O-02** | Mock server 實作可能不完整。 | `mock-server/` | **全面審查與補齊**：在完成 `openapi.yaml` 的更新後，需對 `mock-server/` 的所有端點進行一次全面檢查，確保所有 API 路徑都有對應的模擬回應，並且回應結構與最新契約一致。 |

## 3. 下一步行動計畫

1.  **套用變更**：根據本報告的建議，依次修改 `db_schema.sql` 和 `openapi.yaml`。
2.  **更新 Mock Server**：同步更新 `mock-server/` 的實作以符合最新的 API 契約。
3.  **驗證**：啟動並測試 Mock Server，確保所有變更都已正確應用且服務可正常運行。
4.  **提交**：提交所有修改後的文件，完成本次契約精簡任務。