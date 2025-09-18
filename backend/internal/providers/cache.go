package providers

import (
	"context"
	"encoding/json"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/redis/go-redis/v9"
)

// RedisProvider 實現 Redis 的 CacheProvider
type RedisProvider struct {
	config *CacheConfig
	client *redis.Client
}

// NewRedisProvider 創建新的 Redis 提供者
func NewRedisProvider(config *CacheConfig) (*RedisProvider, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     config.Host + ":" + config.Port,
		Password: config.Password,
		DB:       config.DB,
	})

	// Test connection
	ctx := context.Background()
	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}

	return &RedisProvider{
		config: config,
		client: client,
	}, nil
}

// GetClient 返回 Redis 客戶端
func (r *RedisProvider) GetClient() interface{} {
	return r.client
}

// Set 在 Redis 中存儲值並設置 TTL
func (r *RedisProvider) Set(key string, value interface{}, ttl time.Duration) error {
	ctx := context.Background()

	var data string
	switch v := value.(type) {
	case string:
		data = v
	default:
		jsonBytes, err := json.Marshal(value)
		if err != nil {
			return err
		}
		data = string(jsonBytes)
	}

	return r.client.Set(ctx, key, data, ttl).Err()
}

// Get 從 Redis 中檢索值
func (r *RedisProvider) Get(key string) (interface{}, error) {
	ctx := context.Background()
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}
	return val, nil
}

// Delete 從 Redis 中刪除鍵
func (r *RedisProvider) Delete(key string) error {
	ctx := context.Background()
	return r.client.Del(ctx, key).Err()
}

// Close 關閉 Redis 連接
func (r *RedisProvider) Close() error {
	return r.client.Close()
}

// InMemoryProvider 實現記憶體快取的 CacheProvider
type InMemoryProvider struct {
	cache *bigcache.BigCache
}

// NewInMemoryProvider 創建新的記憶體快取提供者
func NewInMemoryProvider() (*InMemoryProvider, error) {
	config := bigcache.DefaultConfig(10 * time.Minute)
	config.CleanWindow = 1 * time.Minute

	cache, err := bigcache.New(context.Background(), config)
	if err != nil {
		return nil, err
	}

	return &InMemoryProvider{
		cache: cache,
	}, nil
}

// GetClient 返回 BigCache 客戶端
func (i *InMemoryProvider) GetClient() interface{} {
	return i.cache
}

// Set 在記憶體快取中存儲值並設置 TTL
func (i *InMemoryProvider) Set(key string, value interface{}, ttl time.Duration) error {
	var data []byte
	switch v := value.(type) {
	case string:
		data = []byte(v)
	default:
		jsonBytes, err := json.Marshal(value)
		if err != nil {
			return err
		}
		data = jsonBytes
	}

	return i.cache.Set(key, data)
}

// Get 從記憶體快取中檢索值
func (i *InMemoryProvider) Get(key string) (interface{}, error) {
	data, err := i.cache.Get(key)
	if err != nil {
		return nil, err
	}
	return string(data), nil
}

// Delete 從記憶體快取中刪除鍵
func (i *InMemoryProvider) Delete(key string) error {
	return i.cache.Delete(key)
}

// Close 關閉記憶體快取
func (i *InMemoryProvider) Close() error {
	return i.cache.Close()
}
