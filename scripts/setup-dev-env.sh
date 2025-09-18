#!/bin/bash

# SRE 平台開發環境設置腳本
# 此腳本用於快速設置開發環境，使用輕量級的 SQLite + In-Memory 配置

set -e

echo "🚀 SRE 平台 - 開發環境設置"
echo "================================="

# 創建數據目錄
echo "📁 創建數據目錄..."
mkdir -p data

# 設置環境變數
echo "🔧 設置開發環境變數..."
export DB_TYPE=sqlite
export DB_NAME=./data/sre_platform_dev.db
export CACHE_TYPE=inmemory
export SECRETS_TYPE=env
export QUEUE_TYPE=inmemory
export APP_ENV=development
export APP_DEBUG=true

# 創建開發環境配置文件
cat > .env << EOF
# 開發環境配置
DB_TYPE=sqlite
DB_NAME=./data/sre_platform_dev.db
CACHE_TYPE=inmemory
SECRETS_TYPE=env
QUEUE_TYPE=inmemory
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=debug
EOF

echo "✅ 環境配置文件已創建: .env"

# 檢查 Go 環境
if ! command -v go &> /dev/null; then
    echo "❌ 錯誤: Go 未安裝，請先安裝 Go 1.21+"
    exit 1
fi

echo "✅ Go 環境檢查通過"

# 下載依賴
echo "📦 下載 Go 依賴..."
cd backend
go mod tidy
go mod download

# 創建 SQLite 數據庫文件
echo "🗄️ 初始化 SQLite 數據庫..."
touch ../data/sre_platform_dev.db

echo ""
echo "🎉 開發環境設置完成！"
echo ""
echo "📋 可用的命令:"
echo "  • 啟動後端服務: cd backend && go run main.go"
echo "  • 檢查健康狀態: curl http://localhost:8080/health"
echo "  • 測試提供者: curl http://localhost:8080/providers/test"
echo ""
echo "🔧 當前配置:"
echo "  • 資料庫: SQLite (./data/sre_platform_dev.db)"
echo "  • 快取: In-Memory"
echo "  • 機密管理: 環境變數"
echo "  • 隊列系統: In-Memory"
echo ""
echo "💡 提示: 如需切換到生產環境，請編輯 .env 文件中的配置"
