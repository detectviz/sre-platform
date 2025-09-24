#!/bin/bash

# Layout Components 測試執行腳本

echo "🚀 開始執行佈局組件測試..."

# 設置顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 執行測試
echo -e "${YELLOW}📋 執行所有佈局組件測試...${NC}"
npm test -- --testPathPattern=src/components/layouts/__tests__/ --passWithNoTests --verbose

# 檢查測試結果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 所有測試通過！${NC}"
else
    echo -e "${RED}❌ 部分測試失敗${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 生成測試覆蓋率報告...${NC}"
npm test -- --testPathPattern=src/components/layouts/__tests__/ --coverage --coverageDirectory=coverage/layouts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 覆蓋率報告生成成功！${NC}"
    echo -e "${YELLOW}📍 報告位置: coverage/layouts/lcov-report/index.html${NC}"
else
    echo -e "${RED}❌ 覆蓋率報告生成失敗${NC}"
fi

echo -e "${GREEN}🎉 佈局組件測試執行完成！${NC}"
