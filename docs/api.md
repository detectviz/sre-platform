# SRE 平台 API 規範說明

## 概述

本文檔說明了 SRE 平台的 API 規範和 Mock Server 的使用方法。API 規範使用 OpenAPI 3.0 格式定義，便於前後端團隊協作開發。

## 目錄結構

```
docs/api/
├── openapi.yaml     # OpenAPI 規範文件
├── README.md        # 本說明文件

mock-server/
├── db.json          # Mock 數據文件
├── server.js        # Mock Server 實現
├── package.json     # Mock Server 依賴配置
```

## API 規範

### 規範文件

API 規範定義在 `docs/api/openapi.yaml` 文件中，包含了以下模組的接口定義：

1. 認證模組
2. 儀表板模組
3. 資源管理模組
4. 事件管理模組
5. 自動化模組
6. 人員管理模組

### 規範特點

- 使用 OpenAPI 3.0 標準格式
- 包含完整的請求/響應示例
- 定義了統一的錯誤處理格式
- 明確了各接口的權限要求

## Mock Server

### 安裝依賴

在 `mock-server` 目錄下運行：

```bash
npm install
```

### 啟動 Mock Server

```bash
# 一般啟動
npm start

# 開發模式啟動（支持熱重載）
npm run dev
```

啟動後，Mock Server 將運行在 `http://localhost:8080`。

### 使用方法

所有 API 接口都位於 `/api/v1` 路徑下，例如：

- 登入接口：`POST http://localhost:8080/api/v1/auth/login`
- 獲取資源列表：`GET http://localhost:8080/api/v1/resources`

### 數據管理

Mock 數據存儲在 `mock-server/db.json` 文件中，可以直接編輯此文件來修改模擬數據。

## 前端集成

前端項目可以通過以下方式使用 Mock Server：

1. 開發環境下將 API 請求指向 `http://localhost:8080/api/v1`
2. 使用環境變量管理 API 基礎路徑
3. 在後端 API 開發完成後，切換回真實的 API 地址

## 更新規範

當需要更新 API 規範時：

1. 修改 `docs/api/openapi.yaml` 文件
2. 同步更新 `mock-server/db.json` 中的模擬數據
3. 如有必要，調整 `mock-server/server.js` 中的自定義路由邏輯

## 工具推薦

推薦使用以下工具來查看和測試 API 規範：

1. [Swagger UI](https://swagger.io/tools/swagger-ui/) - 可視化 API 文檔
2. [Postman](https://www.postman.com/) - API 測試工具
3. [Insomnia](https://insomnia.rest/) - 另一個優秀的 API 客戶端

## 注意事項

1. 此 API 規範是前後端協作的基礎，任何修改都應經過團隊討論
2. Mock Server 僅用於開發和測試，不可用於生產環境
3. 真實的後端實現應完全符合此 API 規範