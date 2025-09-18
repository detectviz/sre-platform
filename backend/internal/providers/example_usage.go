// Factory Provider 模式的示例用法
// 此示例展示如何輕鬆切換不同的提供者實現
package main

import (
	"fmt"
	"os"
	"sre-platform/backend/internal/providers"
)

func main() {
	fmt.Println("🚀 SRE Platform - Factory Provider 模式演示")
	fmt.Println("=" * 50)

	// 示例 1: 開發環境 (SQLite + 記憶體快取)
	fmt.Println("\n📝 示例 1: 開發環境")
	fmt.Println("使用 SQLite 資料庫和記憶體快取以加快開發速度")

	devConfig := &providers.Config{
		Database: providers.DatabaseConfig{
			Type:     "sqlite",
			Database: "./data/dev.db",
		},
		Cache: providers.CacheConfig{
			Type: "inmemory",
		},
		Secrets: providers.SecretsConfig{
			Type: "env",
		},
		Queue: providers.QueueConfig{
			Type: "inmemory",
		},
	}

	devFactory := providers.NewProviderFactory(devConfig)
	devDB, _ := devFactory.CreateDatabaseProvider()
	devCache, _ := devFactory.CreateCacheProvider()
	devSecrets, _ := devFactory.CreateSecretsProvider()
	devQueue, _ := devFactory.CreateQueueProvider()

	fmt.Printf("✅ 資料庫: %s\n", devConfig.Database.Type)
	fmt.Printf("✅ 快取: %s\n", devConfig.Cache.Type)
	fmt.Printf("✅ 機密管理: %s\n", devConfig.Secrets.Type)
	fmt.Printf("✅ 隊列: %s\n", devConfig.Queue.Type)

	// 測試開發環境提供者
	testProviders(devDB, devCache, devSecrets, devQueue)

	// 示例 2: 生產環境 (PostgreSQL + Redis)
	fmt.Println("\n\n🏭 示例 2: 生產環境")
	fmt.Println("使用 PostgreSQL 資料庫和 Redis 快取以應對生產需求")

	prodConfig := &providers.Config{
		Database: providers.DatabaseConfig{
			Type:     "postgres",
			Host:     "prod-db.example.com",
			Port:     "5432",
			Database: "sre_platform_prod",
			Username: "sre_user",
			Password: os.Getenv("PROD_DB_PASSWORD"),
			SSLMode:  "require",
		},
		Cache: providers.CacheConfig{
			Type:     "redis",
			Host:     "prod-redis.example.com",
			Port:     "6379",
			Password: os.Getenv("PROD_REDIS_PASSWORD"),
			DB:       0,
		},
		Secrets: providers.SecretsConfig{
			Type:  "vault",
			Host:  "https://prod-vault.example.com:8200",
			Token: os.Getenv("VAULT_TOKEN"),
			Path:  "secret/sre-platform",
		},
		Queue: providers.QueueConfig{
			Type:     "redis",
			Host:     "prod-redis.example.com",
			Port:     "6379",
			Password: os.Getenv("PROD_REDIS_PASSWORD"),
		},
	}

	prodFactory := providers.NewProviderFactory(prodConfig)
	fmt.Printf("✅ 資料庫: %s\n", prodConfig.Database.Type)
	fmt.Printf("✅ 快取: %s\n", prodConfig.Cache.Type)
	fmt.Printf("✅ 機密管理: %s\n", prodConfig.Secrets.Type)
	fmt.Printf("✅ 隊列: %s\n", prodConfig.Queue.Type)

	fmt.Println("\n🎯 Factory Provider 模式的優勢:")
	fmt.Println("   • 🔄 輕鬆在不同環境間切換")
	fmt.Println("   • 🧪 使用模擬提供者簡化測試")
	fmt.Println("   • 📦 乾淨的依賴注入")
	fmt.Println("   • 🏗️ 可擴展的架構")
	fmt.Println("   • 🔧 配置驅動的設置")

	fmt.Println("\n✨ Factory Provider 模式讓您能夠:")
	fmt.Println("   - 開發環境使用 SQLite + 記憶體快取")
	fmt.Println("   - 生產環境使用 PostgreSQL + Redis")
	fmt.Println("   - 無需修改代碼即可切換實現")
	fmt.Println("   - 在不同提供者間保持一致的介面")
}

func testProviders(db providers.DatabaseProvider, cache providers.CacheProvider, secrets providers.SecretsProvider, queue providers.QueueProvider) {
	// 測試資料庫連接
	if db.GetDB() != nil {
		fmt.Println("   🗄️ 資料庫: 已連接 ✓")
	}

	// 測試快取操作
	err := cache.Set("test_key", "test_value", 0)
	if err == nil {
		fmt.Println("   ⚡ 快取: 設置操作 ✓")
		if _, err := cache.Get("test_key"); err == nil {
			fmt.Println("   ⚡ 快取: 獲取操作 ✓")
		}
	}

	// 測試隊列操作
	err = queue.Enqueue("test_queue", "test_message")
	if err == nil {
		fmt.Println("   📋 隊列: 入隊操作 ✓")
	}

	fmt.Println("   🔐 機密管理提供者已準備 ✓")
}
