// Package providers 實現 SRE 平台的 Factory Provider 模式
// 此模式允許系統高度可配置，並且與環境無關
package providers

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-gorm/gorm"
)

// ProviderType 定義提供者的類型
type ProviderType string

const (
	DatabaseProvider ProviderType = "database" // 資料庫提供者
	CacheProvider    ProviderType = "cache"    // 快取提供者
	SecretsProvider  ProviderType = "secrets"  // 機密管理提供者
	QueueProvider    ProviderType = "queue"    // 隊列提供者
)

// Config 保存所有提供者的配置
type Config struct {
	Database DatabaseConfig
	Cache    CacheConfig
	Secrets  SecretsConfig
	Queue    QueueConfig
}

// DatabaseConfig 定義資料庫配置
type DatabaseConfig struct {
	Type     string // "postgres", "sqlite", "mysql"
	Host     string
	Port     string
	Database string
	Username string
	Password string
	SSLMode  string
}

// CacheConfig 定義快取配置
type CacheConfig struct {
	Type     string // "redis", "inmemory"
	Host     string
	Port     string
	Password string
	DB       int
}

// SecretsConfig 定義機密管理配置
type SecretsConfig struct {
	Type  string // "vault", "kubernetes", "env"
	Host  string
	Token string
	Path  string
}

// QueueConfig 定義隊列配置
type QueueConfig struct {
	Type     string // "redis", "inmemory"
	Host     string
	Port     string
	Password string
}

// DatabaseProvider 資料庫提供者介面
type DatabaseProvider interface {
	GetDB() *gorm.DB // 獲取資料庫連接
	Close() error    // 關閉連接
	Migrate() error  // 執行資料庫遷移
}

// CacheProvider 快取提供者介面
type CacheProvider interface {
	GetClient() interface{}                                     // 獲取快取客戶端 (redis.Client 或 bigcache.BigCache)
	Set(key string, value interface{}, ttl time.Duration) error // 設置快取
	Get(key string) (interface{}, error)                        // 獲取快取
	Delete(key string) error                                    // 刪除快取
	Close() error                                               // 關閉快取
}

// SecretsProvider 機密管理提供者介面
type SecretsProvider interface {
	GetSecret(path string) (map[string]interface{}, error)    // 獲取機密
	SetSecret(path string, data map[string]interface{}) error // 設置機密
}

// QueueProvider 隊列提供者介面
type QueueProvider interface {
	Enqueue(queue string, message interface{}) error // 加入隊列
	Dequeue(queue string) (interface{}, error)       // 從隊列取出
}

// ProviderFactory 基於配置創建提供者的工廠
type ProviderFactory struct {
	config *Config
}

// NewProviderFactory 創建新的提供者工廠
func NewProviderFactory(config *Config) *ProviderFactory {
	return &ProviderFactory{config: config}
}

// CreateDatabaseProvider 創建資料庫提供者
func (f *ProviderFactory) CreateDatabaseProvider() (DatabaseProvider, error) {
	switch strings.ToLower(f.config.Database.Type) {
	case "postgres":
		return NewPostgreSQLProvider(&f.config.Database)
	case "sqlite":
		return NewSQLiteProvider(&f.config.Database)
	default:
		return NewPostgreSQLProvider(&f.config.Database) // 預設值
	}
}

// CreateCacheProvider 創建快取提供者
func (f *ProviderFactory) CreateCacheProvider() (CacheProvider, error) {
	switch strings.ToLower(f.config.Cache.Type) {
	case "redis":
		return NewRedisProvider(&f.config.Cache)
	case "inmemory":
		return NewInMemoryProvider()
	default:
		return NewRedisProvider(&f.config.Cache) // 預設值
	}
}

// CreateSecretsProvider 創建機密管理提供者
func (f *ProviderFactory) CreateSecretsProvider() (SecretsProvider, error) {
	switch strings.ToLower(f.config.Secrets.Type) {
	case "vault":
		return NewVaultProvider(&f.config.Secrets)
	case "kubernetes":
		return NewKubernetesProvider()
	case "env":
		return NewEnvProvider()
	default:
		return NewEnvProvider() // 預設值
	}
}

// CreateQueueProvider 創建隊列提供者
func (f *ProviderFactory) CreateQueueProvider() (QueueProvider, error) {
	switch strings.ToLower(f.config.Queue.Type) {
	case "redis":
		return NewRedisQueueProvider(&f.config.Queue)
	case "inmemory":
		return NewInMemoryQueueProvider()
	default:
		return NewRedisQueueProvider(&f.config.Queue) // 預設值
	}
}

// LoadConfigFromEnv 從環境變數載入配置
func LoadConfigFromEnv() *Config {
	return &Config{
		Database: DatabaseConfig{
			Type:     getEnv("DB_TYPE", "postgres"),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			Database: getEnv("DB_NAME", "sre_platform"),
			Username: getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Cache: CacheConfig{
			Type:     getEnv("CACHE_TYPE", "redis"),
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		Secrets: SecretsConfig{
			Type:  getEnv("SECRETS_TYPE", "env"),
			Host:  getEnv("VAULT_HOST", "http://localhost:8200"),
			Token: getEnv("VAULT_TOKEN", ""),
			Path:  getEnv("VAULT_PATH", "secret/sre-platform"),
		},
		Queue: QueueConfig{
			Type:     getEnv("QUEUE_TYPE", "redis"),
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
	}
}

// Helper functions 輔助函數
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// 使用示例：
//
// factory := NewProviderFactory(LoadConfigFromEnv())
//
// // 根據環境創建提供者
// db, err := factory.CreateDatabaseProvider()
// cache, err := factory.CreateCacheProvider()
// secrets, err := factory.CreateSecretsProvider()
// queue, err := factory.CreateQueueProvider()
//
// // 使用提供者
// db.GetDB().Find(&users)
// cache.Set("key", "value", time.Hour)
// secret, _ := secrets.GetSecret("database")
// queue.Enqueue("tasks", task)
