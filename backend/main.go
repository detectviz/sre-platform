package main

import (
	"log"
	"net/http"

	"sre-platform/backend/internal/providers"

	"github.com/gin-gonic/gin"
)

func main() {
	// 從環境變數載入配置
	config := providers.LoadConfigFromEnv()

	// 創建提供者工廠
	factory := providers.NewProviderFactory(config)

	// 根據環境初始化提供者
	dbProvider, err := factory.CreateDatabaseProvider()
	if err != nil {
		log.Fatalf("創建資料庫提供者失敗: %v", err)
	}
	defer dbProvider.Close()

	cacheProvider, err := factory.CreateCacheProvider()
	if err != nil {
		log.Fatalf("創建快取提供者失敗: %v", err)
	}
	defer cacheProvider.Close()

	secretsProvider, err := factory.CreateSecretsProvider()
	if err != nil {
		log.Fatalf("創建機密管理提供者失敗: %v", err)
	}

	queueProvider, err := factory.CreateQueueProvider()
	if err != nil {
		log.Fatalf("創建隊列提供者失敗: %v", err)
	}

	// 執行資料庫遷移
	if err := dbProvider.Migrate(); err != nil {
		log.Printf("遷移警告: %v", err)
	}

	// 設置 Gin 路由
	r := gin.Default()

	// 健康檢查端點
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"providers": gin.H{
				"database": config.Database.Type,
				"cache":    config.Cache.Type,
				"secrets":  config.Secrets.Type,
				"queue":    config.Queue.Type,
			},
		})
	})

	// 使用提供者的示例端點
	r.GET("/providers/test", func(c *gin.Context) {
		// 測試資料庫連接
		db := dbProvider.GetDB()
		if db == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "資料庫不可用"})
			return
		}

		// 測試快取
		err := cacheProvider.Set("test_key", "test_value", 0)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "快取設置失敗"})
			return
		}

		value, err := cacheProvider.Get("test_key")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "快取獲取失敗"})
			return
		}

		// 測試隊列
		err = queueProvider.Enqueue("test_queue", "test_message")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "隊列入隊失敗"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":       "所有提供者運行正常",
			"database_type": config.Database.Type,
			"cache_type":    config.Cache.Type,
			"cache_value":   value,
			"queue_type":    config.Queue.Type,
		})
	})

	log.Printf("🚀 SRE Platform 後端啟動，提供者配置:")
	log.Printf("   📊 資料庫: %s", config.Database.Type)
	log.Printf("   ⚡ 快取: %s", config.Cache.Type)
	log.Printf("   🔐 機密管理: %s", config.Secrets.Type)
	log.Printf("   📋 隊列: %s", config.Queue.Type)

	r.Run(":8080")
}
