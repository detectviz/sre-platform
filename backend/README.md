# SRE 平台後端 - 施工計畫 (Construction Plan)

## 🎯 總覽 (Overview)
本文件為 SRE 平台 Go 後端服務的詳細施工計畫，旨在指導開發團隊從零開始，逐步構建一個穩健、可擴展、且符合 `openapi.yaml` 契約的後端系統。

**核心架構**: **Factory Provider 模式**，支援在不同環境（開發/生產）中切換組件實現。

---

## 🚀 Phase 1: 基礎架構與核心設定 (Foundation & Core Setup)
*目標：建立專案骨架，實現核心的工廠模式，並啟動一個基礎的 Web 服務。*

### 1.1: Go 模組初始化
- [ ] 在 `backend/` 目錄下，執行 `go mod init github.com/detectviz/sre-platform/backend` 來建立 `go.mod` 檔案。
- [ ] 執行 `go mod tidy` 來確保依賴關係乾淨。

### 1.2: 專案結構建立
- [ ] 建立以下目錄結構：
  ```
  backend/
  ├── cmd/
  │   └── sre-platform/
  │       └── main.go
  ├── internal/
  │   ├── config/
  │   │   └── config.go
  │   └── providers/
  │       ├── factory.go
  │       ├── database.go
  │       └── cache.go
  └── pkg/
      └── api/
          └── v1/
  ```

### 1.3: 核心介面與工廠實現
- [ ] **`internal/providers/database.go`**: 定義 `DatabaseProvider` 介面，並實作 `SQLite` 版本的 Provider。
- [ ] **`internal/providers/cache.go`**: 定義 `CacheProvider` 介面，並實作 `InMemory` 版本的 Provider。
- [ ] **`internal/config/config.go`**: 實作 `LoadConfigFromEnv()` 函數，用於從環境變數讀取 `DB_TYPE`, `CACHE_TYPE` 等設定。
- [ ] **`internal/providers/factory.go`**: 實作 `NewProviderFactory()` 和 `CreateDatabaseProvider()`, `CreateCacheProvider()` 等工廠方法，根據設定回傳對應的 Provider 實例。

### 1.4: 主應用程式入口
- [ ] **`cmd/sre-platform/main.go`**:
  - [ ] 引入 `Gin` Web 框架 (`go get github.com/gin-gonic/gin`)。
  - [ ] 初始化設定和 Provider Factory。
  - [ ] 建立一個基礎的 Gin 引擎。
  - [ ] 註冊一個 `/healthz` 路由，回傳 `200 OK`。
  - [ ] 啟動 HTTP 伺服器監聽 `8080` 連接埠。

### 1.5: Dockerfile 調整
- [ ] 更新 `backend/Dockerfile` 中的 `COPY` 和 `CMD` 指令，以對應 `cmd/sre-platform/main.go` 的新路徑。

---

## 🚀 Phase 2: 資料庫模型與遷移 (Database Models & Migration)
*目標：根據 `db_schema.sql` 建立 GORM 資料模型，並實現自動化的資料庫遷移。*

### 2.1: GORM 模型定義
- [ ] 在 `internal/models/` 目錄下，為 `users`, `teams`, `roles`, `events`, `resources` 等核心資源建立對應的 Go struct。
- [ ] 為 struct 添加 GORM 標籤 (`gorm:"..."`) 以對應資料庫欄位。

### 2.2: 資料庫遷移整合
- [ ] 在 `DatabaseProvider` 介面中新增 `Migrate()` 方法。
- [ ] 在 `main.go` 中，於伺服器啟動前呼叫 `dbProvider.Migrate()`。
- [ ] 遷移邏輯應使用 `db.AutoMigrate()` 來自動同步 GORM 模型與資料庫 schema。

---

## 🚀 Phase 3: API 端點實現 (API Endpoint Implementation)
*目標：根據 `openapi.yaml` 規格，逐步實現所有 API 端點的業務邏輯。*

### 3.1: 身份與存取管理 (IAM) API
- [ ] **`internal/handlers/iam.go`**: 建立處理 IAM 相關請求的 Handler。
- [ ] **路由註冊**: 在 `main.go` 中，註冊 `/users`, `/teams`, `/roles` 的 GET, POST, PUT, DELETE 路由。
- [ ] **業務邏輯**:
  - 路由 Handler 應從 `DatabaseProvider` 獲取 `*gorm.DB` 實例。
  - 實現對使用者、團隊、角色的增刪改查邏輯。

### 3.2: 事件管理 API
- [ ] **`internal/handlers/events.go`**: 建立處理事件相關請求的 Handler。
- [ ] **路由註冊**: 在 `main.go` 中，註冊 `/events`, `/silence-rules`, `/recurring-silence-rules` 等路由。
- [ ] **業務邏輯**:
  - 實現事件的列表查詢與篩選。
  - 實現 `POST /silence-rules` 的邏輯：根據 `event_id` 查找事件標籤，並建立一個一次性的靜音規則。

### 3.3: 資源管理 API
- [ ] **`internal/handlers/resources.go`**: 建立處理資源相關請求的 Handler。
- [ ] **路由註冊**: 在 `main.go` 中，註冊 `/resources`, `/resource-groups` 等路由。
- [ ] **業務邏輯**:
  - 實現 `aggregateInventory` 的邏輯，聚合多方資料後回傳資源列表。
  - 實現資源群組的管理。

---

## 🚀 Phase 4: 生產環境準備 (Production Readiness)
*目標：實現生產環境所需的 Provider，並完善配置與部署流程。*

### 4.1: 生產級 Provider 實現
- [ ] **`PostgreSQLProvider`**: 實作 `DatabaseProvider` 介面，使用 `gorm.io/driver/postgres` 連接到 PostgreSQL。
- [ ] **`RedisCacheProvider`**: 實作 `CacheProvider` 介面，使用 `go-redis/redis` 連接到 Redis。

### 4.2: 依賴注入與上下文
- [ ] 將初始化的 Providers 注入到 Gin 的 `Context` 中，方便在 Handler 中存取。

### 4.3: 錯誤處理與日誌
- [ ] 建立統一的錯誤處理中間件 (Middleware)。
- [ ] 引入結構化日誌函式庫（如 `logrus` 或 `zap`），並在所有關鍵操作中記錄日誌。

## 📋 最終交付標準
- [ ] 所有後端程式碼皆有合理的單元測試覆蓋。
- [ ] `docker build` 能成功建立可運行的映像檔。
- [ ] 啟動後的服務能成功回應所有在 `openapi.yaml` 中定義的 `GET` 請求。
- [ ] 開發環境 (`SQLite` + `In-Memory`) 和生產環境 (`PostgreSQL` + `Redis`) 的切換能透過環境變數正常工作。
