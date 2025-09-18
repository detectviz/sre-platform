# SRE 平台後端 - Factory Provider 模式

## 🎯 架構概述

本後端服務採用 **Factory Provider 模式** 實現高度可配置的架構，支援在不同環境間輕鬆切換不同的實現方案。

## 🔧 Factory Provider 模式優勢

### 環境靈活性
- **開發環境**: SQLite + In-Memory (快速啟動，無外部依賴)
- **生產環境**: PostgreSQL + Redis (高性能，企業級)
- **測試環境**: 可輕鬆使用模擬提供者

### 組件支援
| 組件 | 支援的實現 | 預設值 |
|------|-----------|--------|
| 資料庫 | PostgreSQL, SQLite | PostgreSQL |
| 快取 | Redis, In-Memory | Redis |
| 機密管理 | Vault, Kubernetes, 環境變數 | 環境變數 |
| 任務隊列 | Redis, In-Memory | Redis |

## 🚀 快速開始

### 開發環境設置

```bash
# 使用自動化腳本
./scripts/setup-dev-env.sh

# 或手動設置
export DB_TYPE=sqlite
export CACHE_TYPE=inmemory
export SECRETS_TYPE=env
export QUEUE_TYPE=inmemory
```

### 啟動服務

```bash
# 進入後端目錄
cd backend

# 下載依賴
go mod tidy

# 啟動服務
go run main.go
```

### 測試端點

```bash
# 健康檢查
curl http://localhost:8080/health

# 測試所有提供者
curl http://localhost:8080/providers/test
```

## 🔧 配置說明

### 環境變數

#### 資料庫配置
```bash
DB_TYPE=sqlite          # 或 postgres
DB_HOST=localhost       # PostgreSQL 專用
DB_PORT=5432           # PostgreSQL 專用
DB_NAME=sre_platform   # 或 ./data/dev.db (SQLite)
DB_USER=postgres       # PostgreSQL 專用
DB_PASSWORD=password   # PostgreSQL 專用
DB_SSL_MODE=disable    # PostgreSQL 專用
```

#### 快取配置
```bash
CACHE_TYPE=inmemory    # 或 redis
REDIS_HOST=localhost  # Redis 專用
REDIS_PORT=6379       # Redis 專用
REDIS_PASSWORD=       # Redis 專用
REDIS_DB=0            # Redis 專用
```

#### 機密管理配置
```bash
SECRETS_TYPE=env       # 或 vault, kubernetes
VAULT_HOST=http://localhost:8200  # Vault 專用
VAULT_TOKEN=token      # Vault 專用
VAULT_PATH=secret/sre  # Vault 專用
```

#### 隊列配置
```bash
QUEUE_TYPE=inmemory    # 或 redis
QUEUE_HOST=localhost  # Redis 專用
QUEUE_PORT=6379       # Redis 專用
QUEUE_PASSWORD=       # Redis 專用
```

## 🏗️ 架構設計

### 核心介面

```go
// 資料庫提供者介面
type DatabaseProvider interface {
    GetDB() *gorm.DB     // 獲取資料庫連接
    Close() error        // 關閉連接
    Migrate() error      // 執行資料庫遷移
}

// 快取提供者介面
type CacheProvider interface {
    GetClient() interface{} // 獲取快取客戶端
    Set(key string, value interface{}, ttl time.Duration) error
    Get(key string) (interface{}, error)
    Delete(key string) error
    Close() error
}
```

### 使用方式

```go
// 載入配置
config := providers.LoadConfigFromEnv()

// 創建工廠
factory := providers.NewProviderFactory(config)

// 根據配置創建提供者
db, _ := factory.CreateDatabaseProvider()
cache, _ := factory.CreateCacheProvider()
secrets, _ := factory.CreateSecretsProvider()
queue, _ := factory.CreateQueueProvider()

// 使用提供者
db.GetDB().Find(&users)
cache.Set("key", "value", time.Hour)
```

## 📁 專案結構

```
backend/
├── main.go                    # 應用程式入口
├── go.mod                     # Go 模組定義
└── internal/
    └── providers/            # Factory Provider 實現
        ├── factory.go         # 核心工廠邏輯
        ├── database.go        # 資料庫提供者實現
        ├── cache.go           # 快取提供者實現
        └── example_usage.go   # 使用示例
```

## 🧪 測試

```bash
# 運行示例
cd internal/providers
go run example_usage.go
```

## 📋 環境差異

| 環境 | 資料庫 | 快取 | 機密管理 | 隊列 |
|------|--------|------|----------|------|
| 開發 | SQLite | In-Memory | 環境變數 | In-Memory |
| 測試 | SQLite | In-Memory | 環境變數 | In-Memory |
| 生產 | PostgreSQL | Redis | HashiCorp Vault | Redis |

## 🔒 安全注意事項

1. **生產環境**: 務必使用強密碼和 SSL 連接
2. **機密管理**: 生產環境應使用 Vault 或 Kubernetes Secret
3. **網路安全**: 確保 Redis 和資料庫服務在安全網路中
4. **環境變數**: 不要在代碼中硬編碼敏感信息

## 🆘 故障排除

### 常見問題

**Q: 無法連接到 PostgreSQL**
```bash
# 檢查服務狀態
docker-compose -f config/docker/docker-compose.yml ps

# 查看日誌
docker-compose -f config/docker/docker-compose.yml logs postgres
```

**Q: Redis 連接失敗**
```bash
# 檢查 Redis 服務
docker-compose -f config/docker/docker-compose.yml ps redis

# 測試連接
docker exec -it sre-redis redis-cli ping
```

## 📚 相關文檔

- [專案架構設計](../docs/architecture.md)
- [資料庫架構設計](../db_schema.sql)
- [API 規範](../openapi.yaml)
- [Docker 環境指南](../config/DOCKER_README.md)
