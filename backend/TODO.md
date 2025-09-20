# SRE 平台 Go 後端 - Master 施工計畫

## 🎯 專案目標
從零開始，使用 Go 語言和 **Factory Provider 模式**，建構一個穩健、可擴展、且完全符合 `openapi.yaml` v3.0.0 契約的後端服務，以取代現有的 `mock-server`。

### 核心架構
- **語言**: Go 1.21+
- **Web 框架**: Gin
- **資料庫 ORM**: GORM
- **設計模式**: Factory Provider，支援在開發 (SQLite, In-Memory) 與生產 (PostgreSQL, Redis) 環境間無縫切換。

---

## 🚀 Phase 1: 專案初始化與核心架構 (Foundation & Core Architecture)
*目標：建立專案骨架，實現核心的工廠模式，並啟動一個可運行的基礎 Web 服務。*

### 🤖 BA-A: 專案架構師 (Backend Agent A: Architect)

#### A1. Go 專案初始化
- [ ] **建立 `go.mod`**: 在 `backend/` 目錄下，執行 `go mod init github.com/detectviz/sre-platform/backend`。
- [ ] **引入核心依賴**:
  - `go get github.com/gin-gonic/gin` (Web 框架)
  - `go get gorm.io/gorm` (ORM 核心)
  - `go get gorm.io/driver/sqlite` (開發用資料庫驅動)
  - `go get github.com/joho/godotenv` (環境變數載入)
- [ ] **建立專案結構**: 建立 `cmd/`, `internal/config`, `internal/providers`, `internal/models` 等目錄。

#### A2. 核心 Provider 介面與工廠
- [ ] **`internal/config/config.go`**: 實作 `LoadConfigFromEnv()` 函數，從環境變數讀取 `DB_TYPE`, `CACHE_TYPE` 等設定。
- [ ] **`internal/providers/database.go`**: 定義 `DatabaseProvider` 介面 (`GetDB`, `Close`, `Migrate`)。
- [ ] **`internal/providers/cache.go`**: 定義 `CacheProvider` 介面 (`Set`, `Get`, `Delete`, `Close`)。
- [ ] **`internal/providers/factory.go`**: 實作 `NewProviderFactory()` 及 `CreateDatabaseProvider`, `CreateCacheProvider` 等工廠方法。

#### A3. 開發環境 Provider 實現
- [ ] **SQLite Provider**: 在 `database.go` 中實作一個符合 `DatabaseProvider` 介面的 `sqliteProvider`。
- [ ] **In-Memory Cache Provider**: 在 `cache.go` 中實作一個符合 `CacheProvider` 介面的 `inMemoryCacheProvider`。

#### A4. 主應用程式入口
- [ ] **`cmd/sre-platform/main.go`**:
  - [ ] 實作 `main` 函數，載入設定，透過工廠模式初始化 `DatabaseProvider`。
  - [ ] 建立 Gin 引擎，並註冊一個 `/api/v1/healthz` 路由，回傳 `200 OK`。
  - [ ] 啟動 HTTP 伺服器。
- [ ] **`Dockerfile`**: 更新 `Dockerfile` 以正確編譯和運行 `cmd/sre-platform/main.go`。
📋 **實現摘要**: 待完成

---

## 🚀 Phase 2: 資料庫模型與 IAM API (Data Models & IAM API)
*目標：建立資料庫模型，實現自動化遷移，並完成身份與存取管理 (IAM) 相關的 API 端點。*

### 🤖 BA-B: IAM 開發者 (Backend Agent B: IAM Developer)

#### B1. GORM 模型與遷移
- [ ] **`internal/models/`**: 根據 `db_schema.sql`，建立 `User`, `Team`, `Role`, `Permission` 等 GORM 模型。
- [ ] **`database.go`**: 在 `sqliteProvider` 中實現 `Migrate()` 方法，使用 `db.AutoMigrate()` 自動遷移上述模型。
- [ ] **`main.go`**: 在啟動時呼叫 `dbProvider.Migrate()`。

#### B2. 身份與存取管理 API
- [ ] **`internal/handlers/iam.go`**: 建立處理 IAM 請求的 `IAMHandler`。
- [ ] **路由註冊**: 在 `main.go` 中，將 `/api/v1/users`, `/api/v1/teams`, `/api/v1/roles` 等路由綁定到 `IAMHandler` 的對應方法。
- [ ] **業務邏輯**:
  - **使用者管理**: 實現使用者的增、刪（軟刪除）、改、查邏輯。
  - **團隊管理**: 實現團隊的增、刪、改、查及成員管理邏輯。
  - **角色管理**: 實現角色的增、刪、改、查及權限指派邏輯。
📋 **實現摘要**: 待完成

---

## 🚀 Phase 3: 核心業務邏輯 API (Core Business Logic API)
*目標：實現事件管理和資源管理這兩大核心功能的 API 端點。*

### 🤖 BA-C: 核心功能開發者 (Backend Agent C: Core Feature Developer)

#### C1. 事件管理 API
- [ ] **GORM 模型**: 建立 `Event`, `Incident`, `SilenceRule`, `RecurringSilenceRule` 等 GORM 模型並加入遷移。
- [ ] **`internal/handlers/events.go`**: 建立 `EventHandler`。
- [ ] **路由註冊**: 註冊 `/api/v1/events`, `/api/v1/incidents`, `/api/v1/silence-rules` 等路由。
- [ ] **業務邏輯**:
  - 實現事件的列表查詢（含篩選）。
  - 實現 `POST /silence-rules` 的邏輯，建立一次性靜音。
  - 實現 `POST /recurring-silence-rules` 的邏輯，建立週期性靜音。

#### C2. 資源管理 API
- [ ] **GORM 模型**: 建立 `Resource`, `ResourceGroup`, `Tag` 等 GORM 模型並加入遷移。
- [ ] **`internal/handlers/resources.go`**: 建立 `ResourceHandler`。
- [ ] **路由註冊**: 註冊 `/api/v1/resources`, `/api/v1/resource-groups` 等路由。
- [ ] **業務邏輯**:
  - 實現資源列表的查詢（可考慮聚合邏輯的初步實現）。
  - 實現資源群組的增刪改查。
📋 **實現摘要**: 待完成

---

## 🚀 Phase 4: 生產環境準備與部署 (Production Readiness & Deployment)
*目標：實現生產環境所需的 Provider，完善日誌、監控，並確保系統可部署。*

### 🤖 BA-D: 維運工程師 (Backend Agent D: DevOps Engineer)

#### D1. 生產級 Provider
- [ ] **PostgreSQL Provider**: 實作 `DatabaseProvider` 介面，使用 `gorm.io/driver/postgres`。
- [ ] **Redis Provider**: 實作 `CacheProvider` 介面，使用 `github.com/go-redis/redis/v8`。

#### D2. 依賴注入與日誌
- [ ] **依賴注入**: 將所有 Providers 透過 Gin 的 Context 注入到 Handlers 中。
- [ ] **結構化日誌**: 引入 `logrus` 或 `zap`，建立日誌中間件，記錄請求資訊和錯誤。

#### D3. 部署與監控
- [ ] **`config/docker/docker-compose.yml`**: 更新此文件以包含新的 `backend` 服務，並與 `postgres`, `redis` 連動。
- [ ] **監控指標**: 在 `/metrics` 端點上，透過 `prometheus/client_golang` 暴露基礎的 HTTP 請求指標。
📋 **實現摘要**: 待完成
