#!/bin/bash

# SRE Platform Docker 環境啟動腳本
# 自動啟動所有 SRE 相關服務

set -e

# === 顏色定義 ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# === 服務檢查函數 ===
check_service() {
    local service_name=$1
    local check_command=$2
    local success_msg=$3

    printf "🔍 正在檢查 %-25s ... " "$service_name"

    if eval "$check_command" >/dev/null 2>&1; then
        printf "${GREEN}✅ 正常${NC}"
        [ -n "$success_msg" ] && printf " - ${YELLOW}%s${NC}" "$success_msg"
        printf "\n"
        return 0
    else
        printf "${RED}❌ 失敗${NC}\n"
        return 1
    fi
}

# === 容器健康檢查函數 ===
check_container_health() {
    local container_name=$1
    local service_name=$2
    local endpoint=$3
    local success_msg=$4

    printf "🔍 正在檢查 %-25s ... " "$service_name"

    # 檢查容器是否運行
    if ! $COMPOSE ps "$container_name" | grep -q "Up"; then
        printf "${RED}❌ 容器未運行${NC}\n"
        return 1
    fi

    # 檢查健康狀態
    local status_line
    status_line=$($COMPOSE ps "$container_name" | grep "$container_name")

    if [[ "$status_line" == *"(healthy)"* ]]; then
        printf "${GREEN}✅ 正常${NC}"
        [ -n "$success_msg" ] && printf " - ${YELLOW}%s${NC}" "$success_msg"
        printf "\n"
        return 0
    elif [[ "$status_line" == *"Up"* ]]; then
        printf "${GREEN}✅ 運行中${NC}"
        [ -n "$success_msg" ] && printf " - ${YELLOW}%s${NC}" "$success_msg"
        printf "\n"
        return 0
    else
        local status_info
        status_info=$(echo "$status_line" | awk '{for(i=4;i<=NF;i++) printf "%s ", $i; print ""}' | tr -d '\n')
        printf "${RED}❌ 狀態異常${NC} (${status_info:-unknown})\n"
        return 1
    fi
}

echo "🚀 啟動 SRE Platform Docker 環境..."

# 檢查 Docker 是否安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 檢查 Docker Compose 是否可用
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 設定 Docker Compose 指令
COMPOSE_FILE="config/docker/docker-compose.yml"
if command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose -f ${COMPOSE_FILE}"
else
    COMPOSE="docker compose -f ${COMPOSE_FILE}"
fi

# 切換到專案根目錄
cd "$(dirname "$0")/../.." || exit 1

# 創建必要的目錄
mkdir -p logs

# 啟動所有服務
echo "📦 啟動服務容器..."
$COMPOSE up -d

echo "⏳ 等待服務啟動..."
sleep 30

# 檢查服務狀態
echo "🔍 檢查服務健康狀態..."

# --- 資料庫服務 ---
echo -e "\n--- 資料庫服務 ---"
check_container_health "postgres" "PostgreSQL" "5432" "可連接資料庫"
check_container_health "redis" "Redis" "6379" "快取服務正常"

# --- 監控服務 ---
echo -e "\n--- 核心監控服務 ---"
check_service "VictoriaMetrics (vmselect)" "curl -s --fail http://localhost:8481/health" "資料查詢 API 正常"
check_service "Prometheus (vmagent)" "curl -s --fail http://localhost:8429/metrics"

# --- 可視化服務 ---
echo -e "\n--- 可視化服務 ---"
check_service "Grafana" "curl -s --fail http://localhost:3000/api/health | grep -q '\"database\": \"ok\"'" "可訪問網址: http://localhost:3000"

# --- AI/ML 服務 ---
echo -e "\n--- AI/ML 服務 ---"
check_service "ChromaDB" "curl -s --fail http://localhost:8000/api/v1/heartbeat | grep -q 'nanosecond heartbeat'"

# --- 身份認證服務 ---
echo -e "\n--- 身份認證服務 ---"
check_service "Keycloak" "curl -s --fail http://localhost:8080/health/ready" "可訪問網址: http://localhost:8080"

# --- 網路監控服務 ---
echo -e "\n--- 網路監控服務 ---"
check_service "SNMP Exporter" "curl -s --fail http://localhost:9116/metrics"

echo ""
echo "========================================="
echo "🎉 SRE Platform Docker 環境啟動完成！"
echo "========================================="
echo ""
echo "📋 服務訪問地址："
echo "  ┌─────────────────────────────────────────────────────────────────────────────┐"
echo "  │ 服務名稱              │ 地址                          │ 認證信息              │"
echo "  ├─────────────────────┼───────────────────────────────┼───────────────────────┤"
echo "  │ PostgreSQL          │ localhost:5432               │ postgres/postgres     │"
echo "  │ Redis               │ localhost:6379               │ -                     │"
echo "  │ Grafana             │ http://localhost:3000        │ admin/admin           │"
echo "  │ VictoriaMetrics     │ localhost:8481               │ -                     │"
echo "  │ Prometheus          │ localhost:8429               │ -                     │"
echo "  │ SNMP Exporter       │ localhost:9116               │ -                     │"
echo "  │ ChromaDB            │ localhost:8000               │ -                     │"
echo "  │ Keycloak            │ http://localhost:8080        │ admin/admin           │"
echo "  │ （可選）後端服務   │ 自行啟動後可接入             │ -                     │"
echo "  │ （可選）前端服務   │ 自行啟動後可接入             │ -                     │"
echo "  └─────────────────────┴───────────────────────────────┴───────────────────────┘"
echo ""
echo "🛠️  管理命令："
echo "  • 查看日誌:     $COMPOSE logs -f [service_name]"
echo "  • 停止服務:     $COMPOSE down"
echo "  • 重啟服務:     $COMPOSE restart [service_name]"
echo "  • 查看狀態:     $COMPOSE ps"
echo "  • 進入容器:     $COMPOSE exec [service_name] bash"
echo ""
echo "🔍 快速健康檢查："
echo "  • curl http://localhost:8481/health                    # VictoriaMetrics"
echo "  • curl http://localhost:3000/api/health               # Grafana"
echo "  • curl http://localhost:8000/api/v1/heartbeat          # ChromaDB"
echo "  • curl http://localhost:8080/health/ready              # Keycloak"
echo "  • $COMPOSE ps # 所有服務狀態"
echo ""
echo "⚠️  故障排除："
echo "  • 如果服務啟動失敗，請檢查日誌："
echo "    $COMPOSE logs [failed_service]"
echo "  • 如果端口衝突，請修改 config/docker/docker-compose.yml 中的端口映射"
echo "  • 如果需要完全重置，請執行："
echo "    $COMPOSE down -v"
echo ""
echo "📚 詳細文檔："
echo "  • 配置說明: config/README.md"
echo "  • Docker 指南: config/DOCKER_README.md"
echo "  • 環境變數: config/env-example.txt"
echo ""
echo "========================================="
