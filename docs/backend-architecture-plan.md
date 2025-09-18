# 從前端原型到後端架構：行動計劃

## 📋 專案總覽

基於 `prototype.html` 和 `docs/pages-param.md` 的分析，本文制定從前端原型到後端架構的完整行動計劃。採用 **UI 驅動的後端設計** 方法論，確保後端功能與前端使用者體驗完全匹配。

## 🎯 核心原則

### UI 驅動的後端設計 (UI-Driven Backend Design)
- **單一可信源**: 前端 `docs/pages-param.md` 中的每個欄位、每個按鈕都是後端設計的依據
- **反向工程**: 從 UI 行為反推數據模型和 API 需求
- **一致性保證**: 確保前端期望與後端實現的完美匹配

---

## 📊 第一階段：數據模型設計 (Data Model Design)

### 階段目標
基於前端數據結構分析，設計完整的數據庫 schema，確保所有前端需要的數據都能被正確儲存和關聯。

### 核心實體分析 (Entity Analysis)

#### 1. 身份與存取管理 (Users & Permissions)
```sql
-- 人員表 (基於 User 結構)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    last_login TIMESTAMP NULL,
    login_count INT DEFAULT 0,
    preferences JSON,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- 團隊表 (基於 Team 結構)
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    INDEX idx_name (name),
    INDEX idx_owner (owner_id)
);

-- 角色表 (基於 Role 結構)
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- 權限表 (基於 Permission 結構)
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_action_resource (action, resource)
);

-- 關聯表：人員團隊 (基於 user_teams)
CREATE TABLE user_teams (
    user_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 關聯表：人員角色 (基於 user_roles)
CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 關聯表：角色權限 (基於 role_permissions)
CREATE TABLE role_permissions (
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 團隊訂閱者表 (基於 Team.subscribers)
CREATE TABLE team_subscribers (
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. 資源管理 (Resources Management)
```sql
-- 資源表 (基於 Resource 結構)
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('server', 'database', 'cache', 'gateway', 'service') NOT NULL,
    status ENUM('healthy', 'warning', 'critical') DEFAULT 'healthy',
    ip_address VARCHAR(45),
    location VARCHAR(255),
    team_id VARCHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_team (team_id),
    INDEX idx_ip (ip_address)
);

-- 標籤鍵表 (基於 Tag 結構)
CREATE TABLE tag_keys (
    id VARCHAR(36) PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_key (key)
);

-- 標籤值表 (基於 TagValue 結構)
CREATE TABLE tag_values (
    id VARCHAR(36) PRIMARY KEY,
    tag_key_id VARCHAR(36) NOT NULL,
    value VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tag_key_id) REFERENCES tag_keys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag_value (tag_key_id, value),
    INDEX idx_value (value)
);

-- 資源標籤關聯表 (基於 resource_tags)
CREATE TABLE resource_tags (
    resource_id VARCHAR(36) NOT NULL,
    tag_value_id VARCHAR(36) NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, tag_value_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_value_id) REFERENCES tag_values(id) ON DELETE CASCADE
);

-- 資源群組表 (基於 Resource Group 結構)
CREATE TABLE resource_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    team_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    INDEX idx_name (name),
    INDEX idx_team (team_id)
);

-- 資源群組成員關聯表
CREATE TABLE resource_group_members (
    group_id VARCHAR(36) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, resource_id),
    FOREIGN KEY (group_id) REFERENCES resource_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);
```

#### 3. 事件與告警管理 (Incidents & Alerts)
```sql
-- 告警規則表 (基於 AlertRule 結構)
CREATE TABLE alert_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target VARCHAR(500) NOT NULL,
    resource_tags JSON,  -- 資源標籤匹配條件
    conditions JSON,     -- 觸發條件 (AlertCondition[])
    notifications JSON,  -- 通知配置 (Notification[])
    enabled BOOLEAN DEFAULT TRUE,
    severity ENUM('critical', 'warning', 'info') DEFAULT 'warning',
    group_by JSON,       -- 分組字段
    labels JSON,         -- 自定義標籤
    annotations JSON,    -- 自定義註解
    creator_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    INDEX idx_name (name),
    INDEX idx_enabled (enabled),
    INDEX idx_creator (creator_id)
);

-- 靜音規則表 (基於 Silence 結構)
CREATE TABLE silence_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('single', 'recurring') DEFAULT 'single',
    matchers JSON,       -- 匹配條件 (Matcher[])
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    created_by_id VARCHAR(36),
    comment TEXT,
    status ENUM('active', 'expired', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_id) REFERENCES users(id),
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by_id),
    INDEX idx_time_range (starts_at, ends_at)
);

-- 告警事件表 (基於 Alert 結構)
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    summary VARCHAR(500) NOT NULL,
    description TEXT,
    severity ENUM('critical', 'warning', 'info') DEFAULT 'warning',
    status ENUM('firing', 'resolved', 'acknowledged') DEFAULT 'firing',
    resource_id VARCHAR(36),
    rule_id VARCHAR(36),
    labels JSON,         -- 告警標籤
    annotations JSON,    -- 告警註解
    value DECIMAL(10,2), -- 觸發值
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by_id VARCHAR(36),
    assigned_to_id VARCHAR(36),
    business_impact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id),
    FOREIGN KEY (acknowledged_by_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_resource (resource_id),
    INDEX idx_rule (rule_id),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_time_range (starts_at, ends_at)
);
```

#### 4. 自動化管理 (Automation)
```sql
-- 自動化腳本表 (基於 Script 結構)
CREATE TABLE automation_scripts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('python', 'bash', 'powershell') DEFAULT 'python',
    description TEXT,
    content TEXT NOT NULL,  -- 腳本內容
    creator_id VARCHAR(36),
    category ENUM('deployment', 'maintenance', 'monitoring') DEFAULT 'maintenance',
    params JSON,  -- 參數定義 (ScriptParameter[])
    status ENUM('active', 'inactive') DEFAULT 'active',
    execution_count INT DEFAULT 0,
    last_executed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_creator (creator_id)
);

-- 排程任務表 (基於 Schedule 結構)
CREATE TABLE schedules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    script_id VARCHAR(36) NOT NULL,
    cron VARCHAR(100) NOT NULL,  -- CRON 表達式
    schedule_mode ENUM('simple', 'advanced') DEFAULT 'simple',
    frequency ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
    enabled BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'error') DEFAULT 'active',
    last_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    last_run_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    creator_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES automation_scripts(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    INDEX idx_name (name),
    INDEX idx_script (script_id),
    INDEX idx_enabled (enabled),
    INDEX idx_status (status),
    INDEX idx_creator (creator_id),
    INDEX idx_next_run (next_run_at)
);

-- 腳本執行日誌表 (基於 Execution 結構)
CREATE TABLE execution_logs (
    id VARCHAR(36) PRIMARY KEY,
    script_id VARCHAR(36) NOT NULL,
    schedule_id VARCHAR(36),  -- 可選，如果是手動執行則為 NULL
    trigger_type ENUM('manual', 'scheduled', 'alert') DEFAULT 'manual',
    trigger_source VARCHAR(255),  -- 觸發來源描述
    status ENUM('running', 'success', 'failed') DEFAULT 'running',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_seconds INT NULL,
    exit_code INT NULL,
    stdout TEXT,
    stderr TEXT,
    error_message TEXT,
    executed_by_id VARCHAR(36),
    params_used JSON,  -- 執行時使用的參數
    resource_usage JSON,  -- 資源消耗統計
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES automation_scripts(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (executed_by_id) REFERENCES users(id),
    INDEX idx_script (script_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_status (status),
    INDEX idx_trigger_type (trigger_type),
    INDEX idx_executed_by (executed_by_id),
    INDEX idx_time_range (start_time, end_time)
);
```

#### 5. 審計日誌 (Audit Logs)
```sql
-- 審計日誌表 (基於 AuditLog 結構)
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,  -- 操作類型
    resource_type VARCHAR(100) NOT NULL,  -- 資源類型
    resource_id VARCHAR(36),  -- 資源ID
    old_values JSON,  -- 修改前的值
    new_values JSON,  -- 修改後的值
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_timestamp (timestamp)
);
```

### 實施步驟

#### 階段 1: 核心表結構 (Week 1)
1. **身份與存取管理表**: `users`, `teams`, `roles`, `permissions`
2. **關聯表**: `user_teams`, `user_roles`, `role_permissions`, `team_subscribers`

#### 階段 2: 資源管理表 (Week 2)
1. **資源表**: `resources`, `resource_groups`
2. **標籤系統**: `tag_keys`, `tag_values`, `resource_tags`
3. **關聯表**: `resource_group_members`

#### 階段 3: 事件與告警表 (Week 3)
1. **規則表**: `alert_rules`, `silence_rules`
2. **事件表**: `alerts`

#### 階段 4: 自動化表 (Week 4)
1. **腳本表**: `automation_scripts`, `schedules`
2. **日誌表**: `execution_logs`

#### 階段 5: 系統表 (Week 5)
1. **審計表**: `audit_logs`
2. **索引優化**: 添加所有必要的索引
3. **約束完善**: 添加外鍵約束和檢查約束

---

## 🔌 第二階段：API 介面定義 (API Interface Design)

### 階段目標
基於前端 API 需求分析，設計完整的 OpenAPI 3.0 規範，確保前端與後端的完美配合。

### API 端點設計原則

#### 1. RESTful 設計原則
- **資源導向**: 使用名詞表示資源
- **HTTP 方法**: GET (查詢), POST (創建), PUT (更新), DELETE (刪除)
- **狀態碼**: 標準 HTTP 狀態碼 (200, 201, 400, 404, 500)

#### 2. 版本控制
- **API 版本**: `/api/v1/` 前綴
- **向後兼容**: 確保 API 變更不會破壞現有客戶端

#### 3. 認證與授權
- **JWT Token**: Bearer Token 認證
- **角色基礎**: 基於人員角色控制資源訪問

### 核心 API 端點

#### 身份與存取管理 APIs
```yaml
# 人員管理
GET /api/v1/users - 獲取人員列表 (分頁、篩選、搜尋)
POST /api/v1/users - 新增人員
GET /api/v1/users/{id} - 獲取人員詳情
PUT /api/v1/users/{id} - 更新人員
DELETE /api/v1/users/{id} - 刪除人員
POST /api/v1/users/{id}/reset-password - 重置密碼

# 團隊管理
GET /api/v1/teams - 獲取團隊列表
POST /api/v1/teams - 新增團隊
GET /api/v1/teams/{id} - 獲取團隊詳情
PUT /api/v1/teams/{id} - 更新團隊
DELETE /api/v1/teams/{id} - 刪除團隊

# 角色管理
GET /api/v1/roles - 獲取角色列表
POST /api/v1/roles - 新增角色
GET /api/v1/roles/{id} - 獲取角色詳情
PUT /api/v1/roles/{id} - 更新角色
DELETE /api/v1/roles/{id} - 刪除角色
```

#### 資源管理 APIs
```yaml
# 資源管理
GET /api/v1/resources - 獲取資源列表 (分頁、篩選、搜尋)
POST /api/v1/resources - 新增資源
GET /api/v1/resources/{id} - 獲取資源詳情
PUT /api/v1/resources/{id} - 更新資源
DELETE /api/v1/resources/{id} - 刪除資源
GET /api/v1/resources/overview - 獲取資源總覽統計

# 資源群組管理
GET /api/v1/resource-groups - 獲取資源群組列表
POST /api/v1/resource-groups - 新增資源群組
GET /api/v1/resource-groups/{id} - 獲取資源群組詳情
PUT /api/v1/resource-groups/{id} - 更新資源群組
DELETE /api/v1/resource-groups/{id} - 刪除資源群組

# 標籤管理
GET /api/v1/tags/keys - 獲取標籤鍵列表
POST /api/v1/tags/keys - 新增標籤鍵
GET /api/v1/tags/values - 獲取標籤值列表
POST /api/v1/tags/values - 新增標籤值
```

#### 事件與告警管理 APIs
```yaml
# 告警事件管理
GET /api/v1/incidents - 獲取告警事件列表
GET /api/v1/incidents/{id} - 獲取告警事件詳情
PUT /api/v1/incidents/{id}/acknowledge - 確認告警
PUT /api/v1/incidents/{id}/assign - 分配告警
POST /api/v1/incidents/{id}/silence - 靜音告警

# 告警規則管理
GET /api/v1/alert-rules - 獲取告警規則列表
POST /api/v1/alert-rules - 新增告警規則
GET /api/v1/alert-rules/{id} - 獲取告警規則詳情
PUT /api/v1/alert-rules/{id} - 更新告警規則
DELETE /api/v1/alert-rules/{id} - 刪除告警規則
POST /api/v1/alert-rules/{id}/test - 測試告警規則

# 靜音規則管理
GET /api/v1/silences - 獲取靜音規則列表
POST /api/v1/silences - 新增靜音規則
GET /api/v1/silences/{id} - 獲取靜音規則詳情
PUT /api/v1/silences/{id} - 更新靜音規則
DELETE /api/v1/silences/{id} - 刪除靜音規則
```

#### 自動化管理 APIs
```yaml
# 腳本管理
GET /api/v1/scripts - 獲取腳本列表
POST /api/v1/scripts - 新增腳本
GET /api/v1/scripts/{id} - 獲取腳本詳情
PUT /api/v1/scripts/{id} - 更新腳本
DELETE /api/v1/scripts/{id} - 刪除腳本
POST /api/v1/scripts/{id}/execute - 執行腳本

# 排程管理
GET /api/v1/schedules - 獲取排程任務列表
POST /api/v1/schedules - 新增排程任務
GET /api/v1/schedules/{id} - 獲取排程任務詳情
PUT /api/v1/schedules/{id} - 更新排程任務
DELETE /api/v1/schedules/{id} - 刪除排程任務
POST /api/v1/schedules/{id}/execute - 手動執行排程任務

# 執行日誌管理
GET /api/v1/executions - 獲取執行日誌列表
GET /api/v1/executions/{id} - 獲取執行日誌詳情
```

#### 系統管理 APIs
```yaml
# 審計日誌
GET /api/v1/audit-logs - 獲取審計日誌列表

# 系統設定
GET /api/v1/settings - 獲取系統設定
PUT /api/v1/settings - 更新系統設定
POST /api/v1/settings/test-email - 測試郵件設定

# 儀表板數據
GET /api/v1/dashboard/overview - 獲取儀表板總覽數據
GET /api/v1/dashboard/alerts-insights - 獲取告警洞察數據
GET /api/v1/dashboard/business - 獲取業務儀表板數據
```

### API 請求響應格式

#### 標準響應格式
```json
{
  "success": true,
  "data": { /* 實際數據 */ },
  "pagination": { /* 分頁信息，可選 */ },
  "message": "操作成功"
}
```

#### 分頁響應格式
```json
{
  "success": true,
  "data": [ /* 數據列表 */ ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### 錯誤響應格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入參數無效",
    "details": { /* 詳細錯誤信息 */ }
  }
}
```

### 實施步驟

#### 階段 1: 核心 API 定義 (Week 1-2)
1. **身份與存取管理 APIs**: 認證、人員管理、角色管理
2. **資源管理 APIs**: 資源 CRUD、分組管理
3. **OpenAPI 文檔結構**: 建立完整的規範結構

#### 階段 2: 業務邏輯 APIs (Week 3-4)
1. **事件與告警 APIs**: 告警規則、靜音規則、事件管理
2. **自動化 APIs**: 腳本管理、排程任務、執行日誌
3. **儀表板 APIs**: 統計數據、圖表數據

#### 階段 3: 系統 APIs (Week 5)
1. **審計 APIs**: 日誌查詢、系統監控
2. **設定 APIs**: 系統配置、通知設定
3. **API 文檔完善**: 添加詳細的示例和說明

---

## 🏗️ 第三階段：後端架構實現 (Backend Implementation)

### 技術棧選擇
- **語言**: Node.js + TypeScript (與前端技術棧一致)
- **框架**: Express.js 或 Fastify
- **數據庫**: MySQL 8.0 (支持 JSON 字段和強大的索引)
- **ORM**: Prisma 或 TypeORM
- **認證**: JWT + Passport.js
- **驗證**: Joi 或 Zod
- **文檔**: Swagger UI (基於 OpenAPI 規範)

### 架構設計原則
1. **分層架構**: Controller -> Service -> Repository -> Database
2. **依賴注入**: 使用 IoC 容器管理依賴
3. **中間件**: 認證、授權、錯誤處理、請求日誌
4. **錯誤處理**: 統一的錯誤響應格式
5. **驗證**: 請求參數和響應數據的雙向驗證

### 實現優先級
1. **Phase 1**: 人員認證與權限管理 (Week 1-2)
2. **Phase 2**: 資源管理系統 (Week 3-4)
3. **Phase 3**: 事件與告警系統 (Week 5-6)
4. **Phase 4**: 自動化系統 (Week 7-8)
5. **Phase 5**: 儀表板與系統整合 (Week 9-10)

---

## 📋 交付物清單

### 1. 數據庫設計
- [ ] `db_schema.sql` - 完整的數據庫結構定義
- [ ] `db_migrations/` - 數據庫遷移腳本
- [ ] `db_seed.sql` - 初始數據填充腳本

### 2. API 設計
- [ ] `openapi.yaml` - OpenAPI 3.0 規範文檔
- [ ] `api-examples/` - API 使用示例和測試數據
- [ ] `postman_collection.json` - Postman 測試集合

### 3. 後端實現
- [ ] `src/` - 完整的後端代碼實現
- [ ] `tests/` - API 測試和集成測試
- [ ] `docs/api/` - API 文檔和使用指南

### 4. 部署配置
- [ ] `docker-compose.yml` - 開發環境配置
- [ ] `Dockerfile` - 應用容器化配置
- [ ] `k8s/` - Kubernetes 部署配置

---

## 📅 時間表與里程碑

### Week 1-2: 基礎架構搭建
- [ ] 數據庫設計與初始化
- [ ] 人員認證系統實現
- [ ] 基本 API 框架搭建

### Week 3-4: 核心功能開發
- [ ] 資源管理模塊
- [ ] 人員權限系統完善
- [ ] API 文檔完善

### Week 5-6: 業務邏輯實現
- [ ] 事件與告警系統
- [ ] 靜音規則管理
- [ ] 告警規則配置

### Week 7-8: 自動化功能
- [ ] 腳本管理系統
- [ ] 排程任務管理
- [ ] 執行引擎實現

### Week 9-10: 系統整合
- [ ] 儀表板數據接口
- [ ] 審計日誌系統
- [ ] 系統設定管理

### Week 11-12: 測試與優化
- [ ] 完整測試覆蓋
- [ ] 性能優化
- [ ] 安全加固

---

## 🔍 品質保證

### 測試策略
1. **單元測試**: 每個服務方法覆蓋率 > 80%
2. **集成測試**: API 端點功能測試
3. **端到端測試**: 完整業務流程測試
4. **性能測試**: API 響應時間 < 200ms
5. **安全測試**: OWASP Top 10 檢查

### 代碼品質
1. **TypeScript 嚴格模式**: 啟用所有嚴格檢查
2. **ESLint + Prettier**: 代碼風格統一
3. **SonarQube**: 代碼品質掃描
4. **PR Review**: 強制代碼審查

### 文檔要求
1. **API 文檔**: 每個端點都有詳細說明
2. **數據庫文檔**: 表結構和關聯說明
3. **部署文檔**: 環境配置和部署指南
4. **人員手冊**: API 使用說明

---

## 🎯 成功指標

### 功能完整性
- [ ] **API 覆蓋率**: 100% 前端需求實現
- [ ] **數據一致性**: 前端期望與後端實現完全匹配
- [ ] **業務邏輯**: 所有核心業務流程正確實現

### 性能指標
- [ ] **響應時間**: API 平均響應 < 100ms
- [ ] **並發處理**: 支持 1000+ 並發請求
- [ ] **數據庫性能**: 查詢響應 < 50ms

### 品質指標
- [ ] **測試覆蓋率**: > 85%
- [ ] **錯誤率**: < 0.1%
- [ ] **可用性**: 99.9% SLA

---

*本文檔將作為 SRE 平台後端開發的唯一指導方針，確保從前端原型到後端實現的完美對應。*
