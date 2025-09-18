package providers

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// PostgreSQLProvider 實現 PostgreSQL 的 DatabaseProvider
type PostgreSQLProvider struct {
	config *DatabaseConfig
	db     *gorm.DB
}

// NewPostgreSQLProvider 創建新的 PostgreSQL 提供者
func NewPostgreSQLProvider(config *DatabaseConfig) (*PostgreSQLProvider, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.Username, config.Password, config.Database, config.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	return &PostgreSQLProvider{
		config: config,
		db:     db,
	}, nil
}

// GetDB 返回資料庫連接
func (p *PostgreSQLProvider) GetDB() *gorm.DB {
	return p.db
}

// Close 關閉資料庫連接
func (p *PostgreSQLProvider) Close() error {
	sqlDB, err := p.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Migrate 執行資料庫遷移
func (p *PostgreSQLProvider) Migrate() error {
	// 自動遷移所有模型
	// 這將根據您的實際模型來實現
	log.Println("PostgreSQL: 執行遷移...")
	return nil
}

// SQLiteProvider 實現 SQLite 的 DatabaseProvider
type SQLiteProvider struct {
	config *DatabaseConfig
	db     *gorm.DB
}

// NewSQLiteProvider 創建新的 SQLite 提供者
func NewSQLiteProvider(config *DatabaseConfig) (*SQLiteProvider, error) {
	dsn := config.Database
	if dsn == "" {
		dsn = "sre_platform.db"
	}

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SQLite: %w", err)
	}

	return &SQLiteProvider{
		config: config,
		db:     db,
	}, nil
}

// GetDB 返回資料庫連接
func (s *SQLiteProvider) GetDB() *gorm.DB {
	return s.db
}

// Close 關閉資料庫連接
func (s *SQLiteProvider) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Migrate 執行資料庫遷移
func (s *SQLiteProvider) Migrate() error {
	// 自動遷移所有模型
	// 這將根據您的實際模型來實現
	log.Println("SQLite: 執行遷移...")
	return nil
}
