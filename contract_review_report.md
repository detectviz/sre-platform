# SRE 平台前後端契約審查報告

**版本**: 1.0
**審查日期**: 2025-09-24
**審查人員**: Jules (資深前端開發者)

## 1. 審查概述

本次審查旨在確保 SRE 平台的前後端契約 (API 規格與資料庫結構) 能夠完整、正確且一致地支援前端開發需求。審查基於以下四份核心文件進行交叉比對：

- `architecture.md` (v3.0)
- `specs.md` (v3.2)
- `openapi.yaml` (v3.0.0)
- `db_schema.sql` (v3.0)

總體而言，契約的完整度相當高，大部分功能均有對應的 API 端點與資料庫結構。然而，審查過程中仍發現一些關鍵問題、缺漏與可增強之處，需在開發前進行修正。

---

## 2. 發現問題與修正方案

### 2.1. (嚴重) 資料庫結構錯誤

- **問題描述**: `db_schema.sql` 中 `resource_groups` 資料表的 `CHECK` 約束 (`chk_resources_status`, `chk_resources_type`) 是從 `resources` 表錯誤複製而來。`resource_groups` 表本身沒有 `status` 或 `type` 欄位，這會導致資料庫遷移 (migration) 或建立時發生嚴重錯誤。
- **影響**: 高。此問題會直接阻礙資料庫的建立與使用。
- **修正方案**:
    - **[必要]** 從 `resource_groups` 的 `CREATE TABLE` 陳述式中移除以下兩行錯誤的 `CONSTRAINT`：
      ```sql
      CONSTRAINT chk_resources_status CHECK (status IN ('healthy','warning','critical','offline')),
      CONSTRAINT chk_resources_type CHECK (type IN ('server','database','cache','gateway','service'))
      ```

### 2.2. (主要) API 契約缺漏

- **問題描述**: `specs.md` 中明確要求，在「儀表板列表」頁面，對於 Grafana 類型的儀表板，應提供「在 Grafana 中編輯」的連結。然而，`openapi.yaml` 中 `GET /dashboards` 端點回傳的 `DashboardSummary` 物件缺少 `grafana_url` 欄位。這會導致前端無法在列表頁高效產生此連結，而需要為每一筆資料額外發送 `GET /dashboards/{id}` 請求，造成嚴重的 N+1 查詢問題。
- **影響**: 中。雖然前端可以透過多次請求來繞過，但會嚴重影響頁面載入效能與使用者體驗。
- **修正方案**:
    - **[必要]** 在 `openapi.yaml` 的 `components.schemas.DashboardSummary` 定義中，新增 `grafana_url` 欄位，使其與 `DashboardDetail` 結構保持一致。
      ```yaml
      # components.schemas.DashboardSummary
      properties:
        # ... 其他欄位
        grafana_url:
          type: string
          nullable: true
          description: Grafana 儀表板原始連結，僅於 dashboard_type 為 grafana 時提供。
        updated_at:
          type: string
          format: date-time
      ```
    - **[必要]** 對應更新 `mock-server/server.js`，確保 `/dashboards` 的 mock 回應中包含 `grafana_url` 欄位。

### 2.3. (主要) 內容資料缺漏

- **問題描述**: `specs.md` 的「版面管理」(`LayoutManagementPage`) 功能詳細定義了各個核心頁面可用的指標卡片 (Widget)。`db_schema.sql` 和 `openapi.yaml` 也已定義了儲存這些設定的 `layout_widgets` 表和相關 API。然而，`db_schema.sql` 檔案中並未包含將這些預設小工具資料 `INSERT` 到 `layout_widgets` 表的陳述式。
- **影響**: 中。缺少這些基礎資料，版面管理功能將無法正常運作，前端無法取得可用的指標卡片清單。
- **修正方案**:
    - **[必要]** 在 `db_schema.sql` 檔案末尾，新增 `INSERT INTO layout_widgets ...` 的 SQL 陳述式，將 `specs.md` (章節 7.3.4) 中定義的 13 種指標卡片預先載入資料庫。

---

## 3. 建議增強項目

### 3.1. API 查詢便利性

- **問題描述**: `GET /events` 端點目前支援依 `assignee_id` (使用者 UUID) 進行篩選。但在前端 UI (如事件列表的篩選器) 中，使用者更傾向於直接輸入或選擇「處理人員名稱」。讓前端先透過名稱找到 UUID 再進行篩選，會增加開發複雜度與 API 請求次數。
- **影響**: 低。
- **建議方案**:
    - **[建議]** 考慮在 `GET /events` 端點新增一個 `assignee_name` (或類似的) 查詢參數，讓後端可以直接處理依名稱的模糊搜尋。

### 3.2. 資料庫命名一致性

- **問題描述**: `architecture.md` 中建議使用 `is_active` 作為使用者啟用狀態的欄位，但 `db_schema.sql` 的 `users` 表中使用的是 `status` (`active`/`disabled`)。
- **影響**: 極低。目前 `status` 的設計更具彈性，且 API 與前端規格均已對齊。
- **建議方案**:
    - **[參考]** 無需修改。僅在此報告中記錄此差異，未來團隊開發時應以 `status` 為準。

## 4. 總結

本次契約審查發現了 1 個嚴重的資料庫結構錯誤、1 個主要的 API 契約缺漏，以及 1 個關鍵的內容資料缺漏。這些問題應在正式開發前優先修正。修正方案已在報告中詳細列出，後續步驟將依此方案執行。

完成修正後，前後端契約將能更好地支援 `specs.md` 所定義的全部功能，為前端開發提供一個穩定、一致且高效的閉環環境。
