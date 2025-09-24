# SRE 平台後端契約審查與精簡報告

**版本**: 1.0
**日期**: 2025-09-24
**審查者**: Jules (資深系統架構師與資料建模專家)

## 1. 總體評價

本平台後端契約（`openapi.yaml`、`db_schema.sql`）結構相對完整，與 UI 規格（`specs.md`）和架構原則（`architecture.md`）大部分保持一致。但也存在一些冗餘、不一致和可以精簡的空間。

核心問題主要集中在：
- **命名不一致**：API 和 DB 之間存在多處命名風格迥異（駝峰式 vs. 蛇形），以及同義詞混用的情況。
- **功能性重複**：部分 API 端點與資料表的功能高度重疊，違反了架構文件中「統一管理層」的原則。
- **結構性冗餘**：API Schema 和資料表欄位有重複定義的情形。

本報告將逐一列出問題並提出修正建議，以達成契約精簡、提升一致性與可維護性的目標。

---

## 2. 問題清單與修正建議

### 2.1 功能比對與重複

#### **問題 2.1.1：事件規則 API/資料表 與架構原則衝突**
- **問題描述**: `openapi.yaml` 中存在 `/event-rules` 相關的大量端點（GET, POST, PUT, DELETE），且 `db_schema.sql` 中有名為 `alert_rule_extensions` 的資料表。這與 `architecture.md` 中「告警執行委託給 Grafana，平台僅作為統一管理層」的原則相衝突。平台不應自行定義一套完整的規則引擎，而是管理與擴充 Grafana 的規則。
- **證據**:
    - `openapi.yaml`: `paths:/event-rules`, `paths:/event-rules/{rule_uid}`
    - `db_schema.sql`: `CREATE TABLE alert_rule_extensions`
    - `architecture.md`: 決策 8 - 「告警執行委託給 Grafana，處理交由平台智能中樞」。
- **修正建議**:
    - **API**: 精簡 `/event-rules` 端點。保留 `GET` 用於從 Grafana 同步快取並附加平台擴充資訊，保留 `POST/PUT` 用於提供友善的介面來「代理」更新 Grafana 規則並儲存擴充設定。刪除 `DELETE` 端點，應引導至 Grafana 介面操作。
    - **DB**: `alert_rule_extensions` 表的用途應嚴格限定為「擴充」Grafana 規則，例如增加 `automation_script_id`、`default_priority` 等平台增值欄位，而非複製 Grafana 的完整規則結構。目前的結構基本符合此原則，但需在 API 層面更清晰地體現。

#### **問題 2.1.2：靜音規則 API 命名混淆**
- **問題描述**: `openapi.yaml` 中同時存在 `/silence-rules` 和 `/events/{event_id}/silence` 兩個與靜音相關的端點。前者用於管理完整的、可重複的靜音規則，後者用於針對單一事件的「快速靜音」。雖然功能不同，但命名上容易混淆，且快速靜音本質上是建立一個與特定事件關聯的單次靜音規則。
- **證據**:
    - `openapi.yaml`: `paths:/silence-rules`, `paths:/events/{event_id}/silence`
- **修正建議**:
    - **API**: 移除 `/events/{event_id}/silence` 端點。將「快速靜音」功能合併至 `POST /silence-rules`。在 Request Body 中增加一個可選的 `event_id` 欄位，當此欄位存在時，後端邏輯自動生成一個與該事件關聯的、單次執行的靜音規則。這樣可以統一入口，簡化契約。

### 2.2 欄位/Schema 冗餘檢查

#### **問題 2.2.1：多個 Summary Schema 重複**
- **問題描述**: `openapi.yaml` 的 `components/schemas` 中存在大量以 `Summary` 結尾的 Schema，例如 `EventSummary`, `ResourceSummary`, `DashboardSummary` 等。它們的用途都是在列表頁面顯示精簡資訊，但其中有很多共通欄位被重複定義，如 `id`, `name`, `status`, `updated_at`。
- **證據**:
    - `openapi.yaml`: `EventSummary`, `ResourceSummary`, `DashboardSummary`, `AutomationScriptSummary`, `TeamSummary`, `RoleSummary` 等。
- **修正建議**:
    - **API**: 建立一個通用的 `BaseSummary` Schema，包含 `id`, `name`, `description`, `created_at`, `updated_at`, `status` 等共通欄位。然後讓各個模組的 `Summary` Schema 透過 `allOf` 繼承 `BaseSummary` 並擴充其特有欄位。這樣可以大幅減少重複定義。

#### **問題 2.2.2：API 回應中存在與 DB 不一致或冗餘的欄位**
- **問題描述**:
    1. `openapi.yaml` 的 `ResourceSummary` 中包含 `cpu_usage`, `memory_usage`, `disk_usage` 等即時指標，但 `db_schema.sql` 的 `resources` 表中也存在同名欄位。根據架構，即時指標應來自時序資料庫（如 VictoriaMetrics），而不應儲存在 PostgreSQL 的資源主表中。主表應只儲存靜態或緩慢變化的資訊。
    2. API 回應中的 `creator` / `owner` 與資料庫中的 `creator_id` / `owner_id` 命名不一致且結構冗餘。API 通常回傳一個包含 `user_id` 和 `display_name` 的物件，而 DB 只存 `user_id`。
- **證據**:
    - `openapi.yaml`: `ResourceSummary`
    - `db_schema.sql`: `resources` 表
- **修正建議**:
    - **DB**: 從 `resources` 表中移除 `cpu_usage`, `memory_usage`, `disk_usage`, `network_in_mbps`, `network_out_mbps` 欄位。這些資料應由後端在回應 `GET /resources` 請求時，動態從指標系統（如 `resource_metrics` 表或其物化檢視）中查詢並填充。
    - **API & DB**: 統一命名。DB 中統一使用 `_id` 後綴，例如 `creator_id`。API 回應中，若需顯示名稱，則由後端進行 JOIN 查詢後，回傳一個結構化的物件，例如 `creator: { user_id: '...', display_name: '...' }`。

### 2.3 一致性檢查

#### **問題 2.3.1：建立者欄位命名不一致**
- **問題描述**: 在 `db_schema.sql` 中，表示「建立者」的欄位命名不統一，同時存在 `creator_id` (如 `teams` 表) 和 `created_by` (如 `automation_scripts` 表)。
- **證據**:
    - `db_schema.sql`: `teams.creator_id`, `automation_scripts.created_by`
- **修正建議**:
    - **DB**: 全面統一為 `creator_id` 或 `created_by`。建議使用 `created_by`，與 `updated_by` 形成對應，語意更清晰。
    - **API**: 同步更新 `openapi.yaml` 中所有相關的 Schema。

#### **問題 2.3.2：時間戳命名不一致**
- **問題描述**: API 和 DB 中表示時間的欄位命名混亂。例如，`events` 表有 `triggered_at`，但 `EventSummary` Schema 中卻是 `trigger_time`。
- **證據**:
    - `db_schema.sql`: `events.triggered_at`
    - `openapi.yaml`: `EventSummary.trigger_time`
- **修正建議**:
    - **API & DB**: 全面統一時間戳欄位的命名風格。建議全部採用蛇形命名法（snake_case）並以 `_at` 結尾，例如：`triggered_at`, `created_at`, `updated_at`, `deleted_at`。

#### **問題 2.3.3：UI/API/DB 欄位缺失**
- **問題描述**: `specs.md` 中「事件列表頁面」要求顯示 `資源名稱 (resource_name)` 和 `規則名稱 (rule_name)`，但在 `db_schema.sql` 的 `events` 表中，這兩個欄位都是可為空的 (`nullable`)，且沒有外鍵約束。這可能導致資料不一致，且前端需要處理空值情況。
- **證據**:
    - `specs.md`: 2.1 事件列表頁面
    - `db_schema.sql`: `events` 表中的 `resource_id` 和 `rule_uid`
- **修正建議**:
    - **DB**: 雖然 `resource_id` 和 `rule_uid` 可能來自外部系統或手動建立，但應盡可能確保其存在。可以考慮在應用層做更強的校驗。對於 `resource_name` 和 `rule_name`，它們是冗餘欄位，應在 API 層面透過 JOIN 查詢從 `resources` 表和 `alert_rule_extensions` 表獲取，而不是直接存在 `events` 表中。
    - **API**: `GET /events` 的回應 `EventSummary` Schema 中，應確保 `resource_name` 和 `rule_name` 欄位總是存在（即使是空字串），以簡化前端處理。

### 2.4 精簡化

#### **問題 2.4.1：可合併的資料表**
- **問題描述**: `db_schema.sql` 中 `event_ai_analysis` 表和 `ai_insight_reports` 表功能高度重疊。前者儲存單一事件的 AI 分析，後者儲存更通用的 AI 洞察報告。這兩者可以合併，透過一個 `report_type` 欄位來區分。
- **證據**:
    - `db_schema.sql`: `CREATE TABLE event_ai_analysis`, `CREATE TABLE ai_insight_reports`
- **修正建議**:
    - **DB**: 刪除 `event_ai_analysis` 表。將其欄位合併至 `ai_insight_reports` 表。新增 `report_type` 欄位（`enum: [event_specific, general]`）和一個可為空的 `event_id` 欄位（並建立外鍵）。
    - **API**: 同步更新 `openapi.yaml`，將 `/events/{event_id}/analysis` 的邏輯改為查詢 `ai_insight_reports` 表。

#### **問題 2.4.2：可統一命名的欄位**
- **問題描述**:
    1.  `silence-rules` vs `mute-rules`：雖然目前契約中已統一為 `silence`，但這是常見的混淆點，需在團隊內強調統一。
    2.  `event_rules` vs `alert_rules`：DB 中使用 `alert_rule_extensions`，API 中使用 `event-rules`，應統一。建議 API 也改為 `/alert-rules` 以更精準地反映其與 Grafana Alerting 的關係。
- **修正建議**:
    - **API**: 將 `/event-rules` 相關路徑重命名為 `/alert-rules`。
    - **團隊規範**: 在開發文檔或 `AGENT.md` 中明確規定術語標準，例如「一律使用 `silence` 而非 `mute`」。

#### **問題 2.4.3：可整併的 API 端點**
- **問題描述**: `openapi.yaml` 中存在大量用於切換布林狀態的端點，如 `/event-rules/{rule_uid}/toggle`。這可以被一個更通用的 `PATCH` 操作取代。
- **證據**:
    - `openapi.yaml`: `paths:/event-rules/{rule_uid}/toggle`, `paths:/automation/schedules/{schedule_id}/toggle`
- **修正建議**:
    - **API**: 移除 `/toggle` 這樣的 RPC 風格端點。改為使用 `PATCH` 方法更新對應資源的 `enabled` 欄位。例如，`PATCH /alert-rules/{rule_uid}` 的 Request Body 可以是 `{"enabled": true}`。這更符合 RESTful 風格。

---

## 3. 下一步行動計畫

基於以上分析，我將按照已設定的計畫，依序執行以下步驟：
1.  **修訂 `db_schema.sql`**
2.  **修訂 `openapi.yaml`**
3.  **更新並驗證 `mock-server`**

所有變更將以本報告的建議為依據。