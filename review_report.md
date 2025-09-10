# SRE 平台 API 架構審查報告

**版本:** 1.0
**審查員:** Jules
**日期:** 2025-09-10

---

## **總體評價 (Overall Assessment)**

本次審查旨在比對前端開發規格書 (`specs.md`) 與後端 API 契約 (`openapi.yaml`)。總體而言，這兩份文件品質極高，展現了優秀的工程實踐。文件定位清晰、內容完整、高度對齊，為 AI 驅動的端到端開發奠定了堅實的基礎。

`specs.md` 作為前端的 SSOT，詳細定義了 UI/UX 和互動邏輯。`openapi.yaml` 則提供了精確的後端數據契約，並透過 `x-*` 擴展欄位巧妙地將非功能性需求、權限模型等元數據納入契約，堪稱典範。

多數情況下，兩份文件保持了驚人的一致性。本報告將聚焦於一些細微的差異點與潛在的優化機會，旨在將這套優秀的文件提升至更高水平。

---

## **1. 文件定位 (Document Purpose)**

- **`specs.md`**: 明確聚焦於 UI/UX、前端元件、網站地圖及使用者流程。其作為前端開發的「唯一、權威的開發規格來源」定位非常清晰。
- **`openapi.yaml`**: 準確定義了後端 API 的數據契約，包含端點、請求/響應 schema、安全性與錯誤碼。
- **對齊狀況**: **高度互補**。兩者職責劃分明確，共同涵蓋了從前端介面到後端 API 呼叫的完整需求鏈。

**結論**: 文件定位完全符合預期，無需調整。

---

## **2. 端點完整性 (Endpoint Completeness)**

- **對齊狀況**: **高度一致**。`specs.md` 中提到的絕大多數 API 端點，都在 `openapi.yaml` 中有對應的定義。

- **潛在缺口與發現**:
    1.  **`openapi.yaml` 中存在但 `specs.md` 未提及的端點**:
        - **端點**: `GET /api/v1/alerts`
        - **描述**: `openapi.yaml` 定義了此端點用於獲取原始的、未經處理的「告警 (Alerts)」。而 `specs.md` 的「事件列表」功能對應的是 `GET /api/v1/incidents`，處理的是更高層級的「事件 (Incidents)」。
        - **建議**:
            - **釐清需求**: 確認前端是否需要一個展示原始告警的獨立介面。
            - **補充規格**: 如果需要，應在 `specs.md` 中為「告警列表」功能補充對應的 UI/UX 規格。如果不需要，可考慮在 `openapi.yaml` 中將此端點標記為 `x-internal: true` 或移除（若無其他系統使用）。

    2.  **關於「維護窗口」的澄清**:
        - **發現**: 使用者問題中提到了「維護窗口 (maintenance windows)」。
        - **分析**: 在兩份文件中，此功能由「靜音規則 (Silences)」實現 (`/api/v1/incidents/silences`)。`specs.md` (章節 10) 和 `openapi.yaml` 均有詳細定義。
        - **建議**: 這屬於術語統一問題。建議在 `specs.md` 的術語表中加入一行，將「維護窗口」對應到「靜音規則」，避免未來產生混淆。

**結論**: 端點完整性極佳，僅需對 `GET /api/v1/alerts` 的用途進行澄清並在 `specs.md` 中補齊。

---

## **3. 命名與描述一致性 (Naming and Description Consistency)**

- **對齊狀況**: **非常一致**。`specs.md` 中的術語標準化規範（章節 2.5）在 `openapi.yaml` 中得到了很好的遵守。

- **微小差異點**:
    1.  **`tags` 命名**:
        - **發現**: `openapi.yaml` 中有一個 `tag` 名為 `"Rules"`，對應 `specs.md` 中的「告警規則 (Alert Rules)」功能。
        - **建議**: 為了更精確的對應，建議將 `openapi.yaml` 中的 `tag: Rules` 修改為 `tag: "Alert Rules"` 或 `tag: "Incident Rules"`。

    2.  **「資源目錄」 vs 「資源列表」**:
        - **分析**: 使用者問題中提到了此項。經查證，`specs.md` 使用的是「資源列表 (Resources List)」，`openapi.yaml` 的 `tag` 是 `"Resources"`。兩者實質上是一致的。
        - **結論**: 此處命名無問題。

**結論**: 命名與描述高度對齊，僅有一個 `tag` 命名可做微調以求完美。

---

## **4. 權限與角色 (Permissions and Roles)**

- **對齊狀況**: **堪稱典範**。`openapi.yaml` 使用 `x-roles` 擴展欄位在每個需要權限的端點上標記了所需角色。`specs.md` 則在此基礎上，生成了非常詳盡的「功能模組權限對照表」（章節 16.6）和「API 端點權限映射表」（章節 16.7）。

- **實踐優點**:
    - **契約即代碼**: 將權限要求直接寫入 API 契約，使得權限成為一個可被自動化工具驗證的項目。
    - **單一真實來源**: 後端 (`openapi.yaml`) 定義權限，前端 (`specs.md`) 消費此定義，確保了兩端的一致性。

**結論**: 權限與角色的定義與同步機制非常出色，無須修改。

---

## **5. 結構與重複定義 (Structure and Redundancy)**

- **整體結構**: **良好**。`openapi.yaml` 廣泛使用了 `$ref` 來引用共享的 `schemas` 和 `responses` (如 `ErrorResponse`, `Pagination`, `OperationResult`)，有效避免了重複定義，提升了可維護性。

- **潛在優化點**:
    1.  **`Capacity` 相關的 Schema**:
        - **發現**: 存在兩個相似的端點和響應：
            - `POST /api/v1/analyzing/capacity` -> `CapacityAnalysisResponse`
            - `POST /api/v1/analyzing/capacity/forecast` -> `CapacityForecastResponse`
        - **分析**: `CapacityAnalysisResponse` 包含了預測、建議、當前用量等多維度分析結果，而 `CapacityForecastResponse` 似乎只返回預測的時間序列數據。後者的功能是前者的子集。
        - **建議**:
            - **合併端點**: 考慮將 `/api/v1/analyzing/capacity/forecast` 的功能合併到 `/api/v1/analyzing/capacity` 中。可以透過一個查詢參數（如 `?mode=full|forecast_only`）來控制返回內容的詳細程度。
            - **重構 Schema**: 如果保留兩個端點，建議對 Schema 進行重構，讓 `CapacityAnalysisResponse` 直接複用 `CapacityForecastResponse`，以減少結構上的重疊。例如：
              ```yaml
              CapacityAnalysisResponse:
                type: object
                properties:
                  # ... other fields
                  forecast:
                    $ref: '#/components/schemas/CapacityForecastResponse'
              ```

**結論**: 整體結構清晰，`Capacity` 相關的 API 和 Schema 是唯一值得審視和簡化的部分。

---

## **6. 非功能性需求 (Non-functional Requirements)**

- **對齊狀況**: **完美**。`specs.md` 中定義的國際化、無障礙、效能、響應式設計等非功能性需求，在 `openapi.yaml` 中透過頂層的 `x-requirements` 擴展欄位進行了精確的標註。

- **實踐優點**:
    - **契約化 NFRs**: 將非功能性需求提升為 API 契約的一部分，確保了前後端團隊對這些重要指標有共同的認知和遵循標準。
    - **可測試性**: 這些標註為未來建立自動化的合規性測試提供了可能性。

**結論**: 非功能性需求的同步機制非常出色，是現代 API 設計的最佳實踐。

---

## **總結與建議 (Summary and Recommendations)**

這是一套非常優秀的規格與契約文件。以下是基於本次審查的具體優化建議，旨在精益求精：

1.  **【建議】釐清 `GET /api/v1/alerts` 用途**: 在 `specs.md` 中補充關於「原始告警列表」的 UI 規格，或確認此 API 是否為內部使用。
2.  **【建議】更新術語表**: 在 `specs.md` 的術語表中增加「維護窗口」等同於「靜音規則」的說明。
3.  **【微調】統一 `openapi.yaml` 的 `tag`**: 將 `tag: Rules` 修改為 `tag: "Alert Rules"`，與 `specs.md` 的章節標題「告警規則」保持一致。
4.  **【可選】簡化 `Capacity` API**: 審視 `POST /api/v1/analyzing/capacity` 和 `POST /api/v1/analyzing/capacity/forecast` 兩個端點，考慮將其合併或重構其響應 Schema，以提高 API 的內聚性。
