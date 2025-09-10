# SRE 平台規格與 API 契約對齊性審查報告

**版本:** 1.0
**審查員:** Jules (API 架構師)
**日期:** 2025-09-09

## 1. 審查目的

本報告旨在記錄對 SRE 平台前端規格 `specs.md` 與後端 API 契約 `openapi.yaml` 的全面審查結果。審查的核心目標是確保兩份文件的無縫對齊，找出並修復所有不一致、缺失或可以改進的地方，為後續的開發、測試與自動化流程提供堅實的基礎。

## 2. 審查範圍

- **前端規格文件:** `specs.md` (版本 3.0)
- **後端 API 文件:** `openapi.yaml` (版本 1.1.0)

## 3. 總體評價

`specs.md` 和 `openapi.yaml` 的初始品質都非常高，大部分內容已經對齊得相當好。前端規格詳盡地描述了使用者介面與互動，而後端 API 契約則結構清晰，並有效利用了擴展屬性 (`x-*`) 來豐富其語意。

主要的改進機會在於**消除潛在的資訊來源衝突**、**補全缺失的細節**以及**提升文件自身的可讀性**。本次審查與修改已成功解決了這些問題。

## 4. 各審查維度的發現與行動

以下將根據六大審查維度，逐項說明本次的發現與所採取的具體行動。

### 4.1. 文件職責與定位 (Document Role & Positioning)

- **發現**: `specs.md` 中包含了對後端業務邏輯的重複定義，例如「資源健康判定規則」和「事件狀態機」。這違反了 `openapi.yaml` 作為 API 契約唯一真實來源 (SSOT) 的原則。
- **行動**:
    - **強化職責劃分**: 修改了 `specs.md` 的第 9.5, 9.6, 17.7 節。
    - **移除重複定義**: 將 `specs.md` 中硬編碼的後端邏輯（如健康狀態判定、事件狀態機規則）移除。
    - **改為引用**: 將上述內容替換為對 `openapi.yaml` 中對應擴展屬性 (`x-resource-status-rules`, `x-incident-lifecycle`, `x-roles`) 的引用，並明確指出 `openapi.yaml` 是唯一權威來源。
- **成果**: 鞏固了文件的職責劃分，降低了未來因規格不同步導致的維護成本。

### 4.2. 端點完整性與一致性 (Endpoint Completeness & Consistency)

- **發現**:
    1.  **命名不一致**: `specs.md` 中使用「告警規則 (Alert Rules)」，而對應的 API 路徑和標籤為 `Incident Rules`。
    2.  **API 列表遺漏**: `specs.md` 的「容量規劃」章節遺漏了 `POST /api/v1/analyzing/capacity/execute-recommendation` 端點。
    3.  **API 不存在**: `specs.md` 的「腳本庫」章節包含了一個不存在的 `POST /api/v1/automation/execute` 端點。
    4.  **文件錯字**: `specs.md` 的目錄和標題中存在錯字。
- **行動**:
    - **統一命名**: 將 `specs.md` 中所有「告警規則」的實例修改為「事件規則」，與 API 定義保持一致。
    - **修正錯字**: 修正了 `specs.md` 中「資源群組」的標題錯字。
    - **同步 API 列表**: 補上了遺漏的 API 端點，並移除了不存在的端點，確保了 `specs.md` 中 API 列表的準確性。
- **成果**: 提升了文件的準確性和一致性，避免開發者參考到錯誤或過時的資訊。

### 4.3. Schema 結構與品質 (Schema Structure & Quality)

- **發現**: 兩份文件在 Schema 層面的對齊度非常高。`openapi.yaml` 的結構良好，已大量使用 `$ref` 進行抽象化，且命名慣例（大駝峰式與蛇形）一致。
- **行動**: 此維度無需進行修改。
- **成果**: 確認了 API Schema 的高品質與高維護性。

### 4.4. 權限與安全模型 (Permission & Security Model)

- **發現**:
    1.  `specs.md` 中的權限映射表 (`17.7 API 端點權限映射`) 嚴重過時且不完整，遺漏了大量需要權限的端點。
    2.  `openapi.yaml` 中對角色的描述 (`x-role-definitions`) 不如 `specs.md` 中的定義詳細。
- **行動**:
    - **同步角色描述**: 將 `specs.md` 中更詳細的角色職責描述更新至 `openapi.yaml` 的 `x-role-definitions` 中，使 API 契約本身更具可讀性。
    - **重新生成權限表**: 根據 `openapi.yaml` 中權威的 `x-roles` 標籤，重新生成了一份完整、準確的權限映射表，並替換了 `specs.md` 中的舊表格。
- **成果**: 確保了前後端對權限模型的理解完全一致，為前端實現精確的權限控制（UI Gating）提供了可靠依據。

### 4.5. 非功能性需求 (Non-Functional Requirements)

- **發現**: `specs.md` 中描述的 NFRs（國際化、無障礙、效能等）已在 `openapi.yaml` 的 `x-requirements` 屬性中被良好地契約化。
- **行動**: 此維度無需進行修改。
- **成果**: 確認了非功能性需求已被納入正式的 API 契約中，有助於後續的自動化驗證。

### 4.6. 文件品質與可讀性 (Documentation Quality & Readability)

- **發現**:
    1.  `openapi.yaml` 的主要結構區塊缺乏頂層註解，對初次閱讀者不夠友好。
    2.  部分通用 Schema（如 `BatchOperationResult`）缺乏描述和範例。
- **行動**:
    - **增加說明註解**: 為 `openapi.yaml` 的主要區塊（`x-*`, `tags`, `paths`, `components`）增加了繁體中文的說明註解。
    - **補充描述與範例**: 為 `BatchOperationResult` Schema 增加了詳細的屬性描述和一個包含成功/失敗案例的 `example`。
- **成果**: 提升了 `openapi.yaml` 的可讀性和易用性，降低了開發者的理解成本。

## 5. 結論

經過本次全面的審查與修改，`specs.md` 與 `openapi.yaml` 已經達到了高度對齊。文件職責更加清晰，內容一致性得到保障，API 契約的品質與可讀性也獲得了提升。這為 SRE 平台專案的「規格驅動開發」實踐奠定了堅實的基礎。
