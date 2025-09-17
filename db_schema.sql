-- =================================================================
-- SRE 平台 PostgreSQL 資料庫結構
-- 版本: 2.0.0
-- 作者: Jules
-- 描述: 此版本根據前端規格 (prototype.html) 進行擴充，確保前後端資料模型一致。
-- 新增了多個欄位並調整了部分結構，以滿足更複雜的業務需求。
-- =================================================================

-- 為主鍵啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- 枚舉類型 (Enumerated Types)
-- 作用：確保資料完整性與一致性。
-- =================================================================

CREATE TYPE resource_type AS ENUM ('server', 'network', 'database', 'application', 'container', 'gateway', 'cache'); -- 資源類型
CREATE TYPE resource_status AS ENUM ('healthy', 'warning', 'critical', 'unknown'); -- 資源健康狀態
CREATE TYPE incident_status AS ENUM ('new', 'acknowledged', 'resolved', 'silenced'); -- 事件狀態
CREATE TYPE incident_severity AS ENUM ('critical', 'error', 'warning', 'info'); -- 事件嚴重性
CREATE TYPE incident_priority AS ENUM ('P0', 'P1', 'P2', 'P3'); -- 事件優先級
CREATE TYPE alert_rule_operator AS ENUM ('gt', 'gte', 'lt', 'lte', 'eq', 'neq'); -- 告警規則運算子
CREATE TYPE silence_status AS ENUM ('active', 'expired', 'disabled'); -- 靜音規則狀態
CREATE TYPE script_language AS ENUM ('python', 'bash', 'powershell', 'javascript'); -- 自動化腳本語言
CREATE TYPE script_category AS ENUM ('diagnostic', 'remediation', 'maintenance', 'custom', 'deployment', 'monitoring'); -- 自動化腳本分類
CREATE TYPE script_status AS ENUM ('active', 'inactive'); -- 自動化腳本狀態
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'success', 'failed'); -- 自動化執行狀態
CREATE TYPE execution_trigger AS ENUM ('manual', 'schedule', 'event'); -- 自動化觸發方式
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending'); -- 使用者狀態
CREATE TYPE notification_channel_type AS ENUM ('email', 'webhook', 'slack', 'line', 'sms'); -- 通知管道類型

-- =================================================================
-- 使用者、團隊與角色 (管理模組)
-- =================================================================

-- 團隊資料表
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- 團隊名稱
    description TEXT, -- 團隊描述
    owner_id UUID REFERENCES users(id), -- 團隊負責人
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 建立時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- 最後更新時間
);
CREATE INDEX idx_teams_name ON teams(name);

-- 使用者資料表
-- 註：密碼等敏感認證資訊由 Keycloak 管理。
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE, -- 使用者名稱
    email VARCHAR(255) NOT NULL UNIQUE, -- 電子郵件
    name VARCHAR(255), -- 顯示名稱
    avatar_url TEXT, -- 頭像 URL
    status user_status NOT NULL DEFAULT 'active', -- 帳號狀態
    last_login TIMESTAMPTZ, -- 最後登入時間
    login_count INTEGER DEFAULT 0, -- 登入次數
    preferences JSONB, -- 用戶偏好設定 (例如: theme, language)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 角色資料表 (用於儲存自定義角色與權限)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- 角色唯一識別碼
    display_name VARCHAR(255) NOT NULL, -- 角色顯示名稱
    description TEXT, -- 角色描述
    is_built_in BOOLEAN NOT NULL DEFAULT FALSE, -- 是否為內建角色
    permissions JSONB, -- 以 JSON 陣列儲存權限
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 使用者與團隊關聯表 (多對多關係)
CREATE TABLE user_teams (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, team_id)
);

-- 使用者與角色關聯表 (多對多關係)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =================================================================
-- 資源與群組
-- =================================================================

-- 資源群組資料表
CREATE TABLE resource_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 群組名稱
    description TEXT, -- 群組描述
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 資源資料表
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 資源名稱
    type resource_type NOT NULL, -- 資源類型
    status resource_status NOT NULL DEFAULT 'unknown', -- 資源狀態
    ip_address INET, -- IP 位址
    location VARCHAR(255), -- 位置資訊
    tags JSONB, -- 以 JSONB 儲存標籤，提高查詢彈性
    config JSONB, -- 儲存特定設定，如連線字串
    -- 註：以下指標性欄位應由 Metrics DB (如 Prometheus) 提供，此處為簡化模型
    cpu_usage NUMERIC(5, 2), -- CPU 使用率
    memory_usage NUMERIC(5, 2), -- 記憶體使用率
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);

-- 資源與群組關聯表 (多對多關係)
CREATE TABLE resource_group_members (
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, group_id)
);

-- =================================================================
-- 事件、規則與靜音
-- =================================================================

-- 事件資料表
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    summary VARCHAR(255) NOT NULL, -- 事件摘要 (取代 title)
    description TEXT, -- 事件描述
    status incident_status NOT NULL DEFAULT 'new', -- 事件狀態
    severity incident_severity NOT NULL, -- 事件嚴重性
    priority incident_priority NOT NULL, -- 事件優先級
    assignee_id UUID REFERENCES users(id), -- 負責人
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL, -- 觸發規則 ID
    business_impact VARCHAR(255), -- 業務影響
    labels JSONB, -- 標籤
    annotations JSONB, -- 註解
    threshold NUMERIC, -- 觸發閾值
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ, -- 解決時間
    acknowledged_at TIMESTAMPTZ -- 確認時間
);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_assignee_id ON incidents(assignee_id);

-- 事件與資源關聯表 (多對多關係)
CREATE TABLE incident_resources (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, resource_id)
);

-- 告警規則資料表
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 規則名稱
    description TEXT, -- 規則描述
    enabled BOOLEAN NOT NULL DEFAULT TRUE, -- 是否啟用
    resource_tags JSONB, -- 資源標籤匹配條件
    conditions JSONB NOT NULL, -- 觸發條件 (取代單一條件欄位)
    notifications JSONB, -- 通知配置
    severity incident_severity NOT NULL, -- 觸發事件的嚴重性
    priority incident_priority NOT NULL, -- 觸發事件的優先級
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 靜音規則資料表
CREATE TABLE silences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 靜音規則名稱
    description TEXT, -- 描述
    matchers JSONB NOT NULL, -- 以 JSONB 儲存彈性的匹配條件
    start_time TIMESTAMPTZ NOT NULL, -- 開始時間
    end_time TIMESTAMPTZ NOT NULL, -- 結束時間
    created_by UUID NOT NULL REFERENCES users(id), -- 建立者
    status silence_status NOT NULL DEFAULT 'active', -- 狀態
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_silences_status ON silences(status);
CREATE INDEX idx_silences_end_time ON silences(end_time);

-- =================================================================
-- 自動化
-- =================================================================

-- 自動化腳本資料表
CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 腳本名稱
    description TEXT, -- 腳本描述
    category script_category NOT NULL, -- 腳本分類
    language script_language NOT NULL, -- 腳本語言
    content TEXT NOT NULL, -- 腳本內容
    parameters JSONB, -- 參數定義 (JSON 陣列)
    status script_status NOT NULL DEFAULT 'active', -- 腳本狀態
    execution_count INTEGER DEFAULT 0, -- 執行次數
    last_executed TIMESTAMPTZ, -- 最後執行時間
    created_by UUID NOT NULL REFERENCES users(id), -- 建立者
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 自動化排程資料表
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE, -- 關聯的腳本
    name VARCHAR(255) NOT NULL, -- 排程名稱
    cron_expression VARCHAR(255) NOT NULL, -- CRON 表達式
    frequency VARCHAR(255), -- 執行頻率 (例如: 'hourly', 'daily')
    schedule_mode VARCHAR(255), -- 排程模式 ('simple' | 'advanced')
    parameters JSONB, -- 執行時參數
    enabled BOOLEAN NOT NULL DEFAULT TRUE, -- 是否啟用
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_schedules_script_id ON schedules(script_id);

-- 自動化執行日誌資料表
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE, -- 執行的腳本
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL, -- 若由排程觸發
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL, -- 若由事件觸發
    trigger_type execution_trigger NOT NULL, -- 觸發方式
    triggered_by_user_id UUID REFERENCES users(id), -- 若為手動觸發
    status execution_status NOT NULL, -- 執行狀態
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 開始時間
    completed_at TIMESTAMPTZ, -- 完成時間
    output TEXT, -- 執行輸出日誌
    error_message TEXT -- 錯誤訊息
);
CREATE INDEX idx_executions_script_id ON executions(script_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at);

-- =================================================================
-- 其他管理與系統資料表
-- =================================================================

-- 通知管道資料表
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- 管道名稱
    type notification_channel_type NOT NULL, -- 管道類型
    enabled BOOLEAN NOT NULL DEFAULT TRUE, -- 是否啟用
    configuration JSONB NOT NULL, -- 儲存管道的特定設定
    template TEXT, -- 通知模板
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 審計日誌資料表
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 操作時間
    user_id UUID REFERENCES users(id), -- 操作者 ID
    username VARCHAR(255), -- 操作者名稱
    action VARCHAR(255) NOT NULL, -- 動作 (create, update, delete...)
    resource_type VARCHAR(255), -- 資源類型
    resource_id VARCHAR(255), -- 資源 ID
    result VARCHAR(255) NOT NULL, -- 結果 (success/failure)
    details JSONB, -- 操作詳情 (例如變更前後的差異)
    ip_address INET -- 操作來源 IP
);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- 系統設定資料表
CREATE TABLE system_settings (
    key VARCHAR(255) PRIMARY KEY, -- 設定鍵
    value JSONB NOT NULL, -- 設定值
    description TEXT, -- 描述
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- 用於自動更新 updated_at 時間戳的觸發器
-- =================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 將觸發器應用於所有包含 updated_at 欄位的資料表
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t_name, t_name);
    END LOOP;
END;
$$;