module sre-platform/backend

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/go-gorm/gorm v1.25.5
	github.com/go-gorm/driver/postgres v1.5.4
	github.com/go-gorm/driver/sqlite v1.5.4
	go.uber.org/zap v1.26.0
	go.opentelemetry.io/otel v1.21.0
	github.com/redis/go-redis/v9 v9.3.0
	github.com/allegro/bigcache/v3 v3.1.0
	github.com/hashicorp/vault/api v1.10.0
	github.com/joho/godotenv v1.5.1
)
