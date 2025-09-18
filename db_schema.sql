-- SRE 平台數據庫架構
-- 基於前端原型分析設計的完整數據庫結構
-- 生成時間: 2025年9月

-- 使用 UTF8MB4 字符集支持完整的 Unicode
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 身份與存取管理模塊 (Users & Permissions)
-- ===========================================

-- 人員表
-- 人員表 (與 Keycloak 同步)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT '人員唯一標識 (同步 Keycloak UUID)',
    username VARCHAR(255) UNIQUE NOT NULL COMMENT '登入用名 (同步 Keycloak)',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '電子郵件 (同步 Keycloak)',
    name VARCHAR(100) NOT NULL COMMENT '顯示名稱',
    avatar_url VARCHAR(500) COMMENT '頭像URL',
    last_login_at TIMESTAMP NULL COMMENT '最後登入時間',
    preferences JSON COMMENT '人員平台偏好設定',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '人員是否在平台內啟用 (非 Keycloak 狀態)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    INDEX idx_username (username) COMMENT '人員名索引',
    INDEX idx_email (email) COMMENT '郵箱索引',
    INDEX idx_is_active (is_active) COMMENT '活躍狀態索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員表 (Keycloak 代理)';

-- 團隊表
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY COMMENT '團隊唯一標識',
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '團隊名稱',
    description TEXT COMMENT '團隊描述',
    leader_id VARCHAR(36) COMMENT '團隊負責人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL COMMENT '負責人外鍵',
    INDEX idx_name (name) COMMENT '團隊名稱索引',
    INDEX idx_leader_id (leader_id) COMMENT '負責人索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊表';

-- 角色表
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY COMMENT '角色唯一標識',
    name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名稱',
    description TEXT COMMENT '角色描述',
    is_built_in BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否為內建角色 (不可刪除)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    INDEX idx_name (name) COMMENT '角色名稱索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 人員團隊關聯表
CREATE TABLE user_teams (
    user_id VARCHAR(36) NOT NULL COMMENT '人員ID',
    team_id VARCHAR(36) NOT NULL COMMENT '團隊ID',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',

    PRIMARY KEY (user_id, team_id) COMMENT '複合主鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '人員外鍵',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE COMMENT '團隊外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員團隊關聯表';

-- 人員角色關聯表
CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL COMMENT '人員ID',
    role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配時間',

    PRIMARY KEY (user_id, role_id) COMMENT '複合主鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '人員外鍵',
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE COMMENT '角色外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員角色關聯表';

-- 角色權限關聯表
CREATE TABLE role_permissions (
    role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
    permission_key VARCHAR(255) NOT NULL COMMENT '權限鍵 (定義於程式碼中)',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授予時間',

    PRIMARY KEY (role_id, permission_key) COMMENT '複合主鍵',
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE COMMENT '角色外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色權限關聯表';

-- 團隊訂閱者表
CREATE TABLE team_subscribers (
    team_id VARCHAR(36) NOT NULL COMMENT '團隊ID',
    user_id VARCHAR(36) NOT NULL COMMENT '人員ID',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '訂閱時間',

    PRIMARY KEY (team_id, user_id) COMMENT '複合主鍵',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE COMMENT '團隊外鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '人員外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊訂閱者表';

-- ===========================================
-- 資源管理模塊 (Resources Management)
-- ===========================================

-- 資源表
CREATE TABLE resources (
    id VARCHAR(36) PRIMARY KEY COMMENT '資源唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '資源名稱',
    type ENUM('server', 'database', 'cache', 'gateway', 'service') NOT NULL COMMENT '資源類型',
    status ENUM('healthy', 'warning', 'critical') DEFAULT 'healthy' COMMENT '健康狀態',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    location VARCHAR(255) COMMENT '位置資訊',
    team_id VARCHAR(36) COMMENT '負責團隊ID',
    description TEXT COMMENT '資源描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (team_id) REFERENCES teams(id) COMMENT '團隊外鍵',
    INDEX idx_name (name) COMMENT '資源名稱索引',
    INDEX idx_type (type) COMMENT '資源類型索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_team (team_id) COMMENT '團隊索引',
    INDEX idx_ip (ip_address) COMMENT 'IP地址索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源表';

-- 標籤鍵表
-- 標籤治理 - 標籤鍵定義表
CREATE TABLE tag_keys (
    id VARCHAR(36) PRIMARY KEY COMMENT '標籤鍵唯一標識',
    key_name VARCHAR(100) UNIQUE NOT NULL COMMENT '標籤鍵',
    description TEXT COMMENT '標籤描述',
    is_required BOOLEAN DEFAULT FALSE COMMENT '是否必填',
    validation_regex VARCHAR(255) COMMENT '值的驗證正則表達式',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤治理 - 標籤鍵定義';

-- 標籤治理 - 標籤允許值表
CREATE TABLE tag_allowed_values (
    id VARCHAR(36) PRIMARY KEY,
    tag_key_id VARCHAR(36) NOT NULL,
    value VARCHAR(255) NOT NULL,
    color VARCHAR(7) COMMENT 'UI 顯示顏色',
    FOREIGN KEY (tag_key_id) REFERENCES tag_keys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag_value (tag_key_id, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤治理 - 標籤允許值';

-- 資源標籤關聯表
CREATE TABLE resource_tags (
    resource_id VARCHAR(36) NOT NULL COMMENT '資源ID',
    tag_key VARCHAR(100) NOT NULL,
    tag_value VARCHAR(255) NOT NULL,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, tag_key),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_tag_key_value (tag_key, tag_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源標籤關聯表';

-- 資源群組表
CREATE TABLE resource_groups (
    id VARCHAR(36) PRIMARY KEY COMMENT '群組唯一標識',
    name VARCHAR(255) UNIQUE NOT NULL COMMENT '群組名稱',
    description TEXT COMMENT '群組描述',
    type ENUM('static', 'dynamic') NOT NULL DEFAULT 'static' COMMENT '群組類型',
    rules JSON COMMENT '動態群組的標籤匹配規則',
    responsible_team_id VARCHAR(36) COMMENT '負責團隊ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (responsible_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_team_id (responsible_team_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源群組表';

-- 資源群組成員關聯表
CREATE TABLE resource_group_members (
    group_id VARCHAR(36) NOT NULL COMMENT '群組ID',
    resource_id VARCHAR(36) NOT NULL COMMENT '資源ID',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',

    PRIMARY KEY (group_id, resource_id) COMMENT '複合主鍵',
    FOREIGN KEY (group_id) REFERENCES resource_groups(id) ON DELETE CASCADE COMMENT '群組外鍵',
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE COMMENT '資源外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源群組成員關聯表';

-- ===========================================
-- 事件與告警管理模塊 (Incidents & Alerts)
-- ===========================================

-- 週期性靜音規則表 (平台核心功能)
CREATE TABLE recurring_silence_rules (
    id VARCHAR(36) PRIMARY KEY COMMENT '靜音規則唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '規則名稱',
    description TEXT COMMENT '規則描述',
    matchers JSON NOT NULL COMMENT 'Grafana 標籤匹配條件',
    cron_expression VARCHAR(100) NOT NULL COMMENT 'CRON 表達式',
    duration_minutes INT NOT NULL COMMENT '每次靜音持續時間(分鐘)',
    timezone VARCHAR(50) DEFAULT 'UTC' COMMENT 'CRON 表達式使用的時區',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否啟用',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='週期性靜音規則表';

-- 事件表 (Events)
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY COMMENT '事件唯一標識',
    summary VARCHAR(500) NOT NULL COMMENT '告警摘要',
    description TEXT COMMENT '告警描述',
    severity ENUM('critical', 'warning', 'info') DEFAULT 'warning' COMMENT '嚴重性',
    status ENUM('firing', 'resolved', 'acknowledged') DEFAULT 'firing' COMMENT '狀態',
    resource_id VARCHAR(36) COMMENT '相關資源ID',
    rule_id VARCHAR(36) COMMENT '觸發規則ID',
    labels JSON COMMENT '告警標籤',
    annotations JSON COMMENT '告警註解',
    value DECIMAL(10,2) COMMENT '觸發值',
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '開始時間',
    ends_at TIMESTAMP NULL COMMENT '結束時間',
    acknowledged_at TIMESTAMP NULL COMMENT '確認時間',
    acknowledged_by_id VARCHAR(36) COMMENT '確認者ID',
    assigned_to_id VARCHAR(36) COMMENT '分配對象ID',
    business_impact VARCHAR(255) COMMENT '業務影響',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (resource_id) REFERENCES resources(id) COMMENT '資源外鍵',
    FOREIGN KEY (rule_id) REFERENCES alert_rules(id) COMMENT '規則外鍵',
    FOREIGN KEY (acknowledged_by_id) REFERENCES users(id) COMMENT '確認者外鍵',
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) COMMENT '分配對象外鍵',
    INDEX idx_severity (severity) COMMENT '嚴重性索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_resource (resource_id) COMMENT '資源索引',
    INDEX idx_rule (rule_id) COMMENT '規則索引',
    INDEX idx_assigned_to (assigned_to_id) COMMENT '分配對象索引',
    INDEX idx_time_range (starts_at, ends_at) COMMENT '時間範圍索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警事件表';

-- ===========================================
-- 自動化管理模塊 (Automation)
-- ===========================================

-- 自動化腳本表
-- 自動化腳本元數據表 (內容儲存於 Git)
CREATE TABLE automation_scripts (
    id VARCHAR(36) PRIMARY KEY COMMENT '腳本唯一標識',
    name VARCHAR(255) UNIQUE NOT NULL COMMENT '腳本名稱',
    type ENUM('python', 'bash', 'powershell') DEFAULT 'python' COMMENT '腳本類型',
    description TEXT COMMENT '腳本描述',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    category ENUM('deployment', 'maintenance', 'monitoring') DEFAULT 'maintenance' COMMENT '分類',
    parameters_definition JSON COMMENT '參數定義',
    git_repo_url VARCHAR(500) NOT NULL COMMENT 'Git 倉庫 URL',
    commit_hash VARCHAR(40) NOT NULL COMMENT '當前版本的 Commit Hash',
    version VARCHAR(20) NOT NULL COMMENT '當前版本號',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '狀態',
    execution_count INT DEFAULT 0 COMMENT '執行次數',
    last_executed_at TIMESTAMP NULL COMMENT '最後執行時間',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_creator (creator_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自動化腳本元數據表';

-- 排程任務表
CREATE TABLE schedules (
    id VARCHAR(36) PRIMARY KEY COMMENT '排程任務唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '任務名稱',
    description TEXT COMMENT '任務描述',
    script_id VARCHAR(36) NOT NULL COMMENT '執行的腳本ID',
    cron VARCHAR(100) NOT NULL COMMENT 'CRON表達式',
    schedule_mode ENUM('simple', 'advanced') DEFAULT 'simple' COMMENT '排程模式',
    frequency ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily' COMMENT '執行頻率',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    status ENUM('active', 'inactive', 'error') DEFAULT 'active' COMMENT '狀態',
    last_status ENUM('success', 'failed', 'pending') DEFAULT 'pending' COMMENT '最後執行狀態',
    last_run_at TIMESTAMP NULL COMMENT '最後執行時間',
    next_run_at TIMESTAMP NULL COMMENT '下次執行時間',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (script_id) REFERENCES automation_scripts(id) COMMENT '腳本外鍵',
    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '任務名稱索引',
    INDEX idx_script (script_id) COMMENT '腳本索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引',
    INDEX idx_next_run (next_run_at) COMMENT '下次執行索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排程任務表';

-- 腳本執行日誌表
CREATE TABLE execution_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '執行日誌唯一標識',
    script_id VARCHAR(36) NOT NULL COMMENT '腳本ID',
    schedule_id VARCHAR(36) COMMENT '排程任務ID',
    trigger_type ENUM('manual', 'scheduled', 'alert') DEFAULT 'manual' COMMENT '觸發類型',
    trigger_source VARCHAR(255) COMMENT '觸發來源描述',
    status ENUM('running', 'success', 'failed') DEFAULT 'running' COMMENT '執行狀態',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '開始時間',
    end_time TIMESTAMP NULL COMMENT '結束時間',
    duration_seconds INT NULL COMMENT '執行持續時間(秒)',
    exit_code INT NULL COMMENT '退出代碼',
    stdout TEXT COMMENT '標準輸出',
    stderr TEXT COMMENT '標準錯誤輸出',
    error_message TEXT COMMENT '錯誤信息',
    executed_by_id VARCHAR(36) COMMENT '執行者ID',
    params_used JSON COMMENT '使用的參數',
    resource_usage JSON COMMENT '資源消耗統計',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (script_id) REFERENCES automation_scripts(id) COMMENT '腳本外鍵',
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) COMMENT '排程任務外鍵',
    FOREIGN KEY (executed_by_id) REFERENCES users(id) COMMENT '執行者外鍵',
    INDEX idx_script (script_id) COMMENT '腳本索引',
    INDEX idx_schedule (schedule_id) COMMENT '排程任務索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_trigger_type (trigger_type) COMMENT '觸發類型索引',
    INDEX idx_executed_by (executed_by_id) COMMENT '執行者索引',
    INDEX idx_time_range (start_time, end_time) COMMENT '時間範圍索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='腳本執行日誌表';

-- 儀表板基礎表
CREATE TABLE dashboards (
    id VARCHAR(36) PRIMARY KEY COMMENT '儀表板唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '儀表板名稱',
    description TEXT COMMENT '儀表板描述',
    layout_config JSON NOT NULL COMMENT '佈局配置',
    widgets_config JSON COMMENT '小組件配置',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公開',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否為默認儀表板',
    created_by VARCHAR(36) NOT NULL COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (created_by) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '名稱索引',
    INDEX idx_created_by (created_by) COMMENT '創建者索引',
    INDEX idx_is_public (is_public) COMMENT '公開狀態索引',
    INDEX idx_is_default (is_default) COMMENT '默認狀態索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='儀表板基礎表';

-- ===========================================
-- 通知管理模塊 (Notification Management)
-- ===========================================

-- 通知管道表
CREATE TABLE notification_channels (
    id VARCHAR(36) PRIMARY KEY COMMENT '通知管道唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '管道名稱',
    type ENUM('email', 'slack', 'webhook', 'sms', 'pagerduty', 'wechat') NOT NULL COMMENT '管道類型',
    config JSON NOT NULL COMMENT '管道配置信息',
    description TEXT COMMENT '管道描述',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_type (type) COMMENT '管道類型索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知管道表';

-- 通知模板表
CREATE TABLE notification_templates (
    id VARCHAR(36) PRIMARY KEY COMMENT '模板唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '模板名稱',
    type ENUM('email', 'slack', 'webhook', 'sms') NOT NULL COMMENT '模板類型',
    subject VARCHAR(500) COMMENT '郵件主題模板',
    content TEXT NOT NULL COMMENT '模板內容',
    variables JSON COMMENT '模板變數定義',
    description TEXT COMMENT '模板描述',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_type (type) COMMENT '模板類型索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知模板表';

-- 通知策略表
CREATE TABLE notification_policies (
    id VARCHAR(36) PRIMARY KEY COMMENT '策略唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '策略名稱',
    description TEXT COMMENT '策略描述',
    resource_type VARCHAR(100) COMMENT '資源類型過濾',
    resource_tags JSON COMMENT '資源標籤匹配條件',
    alert_conditions JSON COMMENT '告警條件匹配',
    match_conditions JSON COMMENT '智慧匹配條件配置',
    channels JSON NOT NULL COMMENT '通知管道列表',
    escalation JSON COMMENT '升級策略',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引',
    INDEX idx_resource_type (resource_type) COMMENT '資源類型索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略表';

-- 通知歷史記錄表
CREATE TABLE notification_history (
    id VARCHAR(36) PRIMARY KEY COMMENT '通知記錄唯一標識',
    event_id VARCHAR(36) COMMENT '關聯事件ID',
    policy_id VARCHAR(36) COMMENT '觸發的策略ID',
    channel_id VARCHAR(36) COMMENT '使用的管道ID',
    recipient VARCHAR(500) NOT NULL COMMENT '接收者地址或描述',
    status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending' COMMENT '發送狀態',
    error_message TEXT COMMENT '失敗時的錯誤訊息',
    raw_payload JSON COMMENT '從 Grafana Webhook 接收到的原始 JSON Payload',
    sent_at TIMESTAMP NULL COMMENT '發送時間',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (channel_id) REFERENCES notification_channels(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知歷史記錄表';

-- ===========================================
-- 審計日誌模塊 (Audit Logs)
-- ===========================================

-- 審計日誌表
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '審計日誌唯一標識',
    user_id VARCHAR(36) COMMENT '操作人員ID',
    action VARCHAR(100) NOT NULL COMMENT '操作類型',
    resource_type VARCHAR(100) NOT NULL COMMENT '資源類型',
    resource_id VARCHAR(36) COMMENT '資源ID',
    old_values JSON COMMENT '修改前的值',
    new_values JSON COMMENT '修改後的值',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '人員代理',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作時間',

    FOREIGN KEY (user_id) REFERENCES users(id) COMMENT '人員外鍵',
    INDEX idx_user (user_id) COMMENT '人員索引',
    INDEX idx_action (action) COMMENT '操作索引',
    INDEX idx_resource (resource_type, resource_id) COMMENT '資源索引',
    INDEX idx_timestamp (timestamp) COMMENT '時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='審計日誌表';

-- ===========================================
-- 系統設定模塊 (System Settings)
-- ===========================================

-- 系統設定表
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY COMMENT '設定唯一標識',
    category VARCHAR(100) NOT NULL COMMENT '設定分類',
    key VARCHAR(255) NOT NULL COMMENT '設定鍵',
    value JSON NOT NULL COMMENT '設定值',
    description TEXT COMMENT '設定描述',
    updated_by_id VARCHAR(36) COMMENT '最後更新者ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (updated_by_id) REFERENCES users(id) COMMENT '更新者外鍵',
    UNIQUE KEY unique_category_key (category, key) COMMENT '分類鍵唯一約束',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_key (key) COMMENT '鍵索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統設定表';

-- 人員偏好設定表
CREATE TABLE user_preferences (
    id VARCHAR(36) PRIMARY KEY COMMENT '偏好設定唯一標識',
    user_id VARCHAR(36) NOT NULL COMMENT '人員ID',
    category VARCHAR(100) NOT NULL COMMENT '設定分類',
    key VARCHAR(255) NOT NULL COMMENT '設定鍵',
    value JSON NOT NULL COMMENT '設定值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '人員外鍵',
    UNIQUE KEY unique_user_category_key (user_id, category, key) COMMENT '人員分類鍵唯一約束',
    INDEX idx_user (user_id) COMMENT '人員索引',
    INDEX idx_category (category) COMMENT '分類索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員偏好設定表';

-- 系統配置模板表
CREATE TABLE system_config_templates (
    id VARCHAR(36) PRIMARY KEY COMMENT '配置模板唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '模板名稱',
    description TEXT COMMENT '模板描述',
    category VARCHAR(100) NOT NULL COMMENT '配置分類',
    template_data JSON NOT NULL COMMENT '模板配置數據',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否為默認模板',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_default (is_default) COMMENT '默認模板索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統配置模板表';

-- 系統維護窗口表
CREATE TABLE maintenance_windows (
    id VARCHAR(36) PRIMARY KEY COMMENT '維護窗口唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '窗口名稱',
    description TEXT COMMENT '窗口描述',
    start_time TIMESTAMP NOT NULL COMMENT '開始時間',
    end_time TIMESTAMP NOT NULL COMMENT '結束時間',
    timezone VARCHAR(50) DEFAULT 'UTC' COMMENT '時區',
    recurrence JSON COMMENT '重複規則',
    affected_resources JSON COMMENT '受影響資源',
    notification_settings JSON COMMENT '通知設定',
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled' COMMENT '狀態',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_time_range (start_time, end_time) COMMENT '時間範圍索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統維護窗口表';

-- ===========================================
-- 智慧輸入選項管理模塊 (Smart Input Options)
-- ===========================================

-- 智慧輸入選項表 (支援通知策略的智慧輸入功能)
-- 初始化數據示例：
-- INSERT INTO smart_input_options (id, category, key, value, display_name, color, sort_order) VALUES
--   (UUID(), 'severity', 'critical', 'critical', '嚴重', 'red', 1),
--   (UUID(), 'severity', 'warning', 'warning', '警告', 'orange', 2),
--   (UUID(), 'severity', 'info', 'info', '資訊', 'blue', 3),
--   (UUID(), 'env', 'production', 'production', '生產環境', NULL, 1),
--   (UUID(), 'env', 'staging', 'staging', '測試環境', NULL, 2),
--   (UUID(), 'team', 'devops', 'DevOps Team', 'DevOps 團隊', NULL, 1);
CREATE TABLE smart_input_options (
    id VARCHAR(36) PRIMARY KEY COMMENT '選項唯一標識',
    category VARCHAR(100) NOT NULL COMMENT '選項分類 (severity, env, team, component, category, instance, service)',
    key VARCHAR(255) NOT NULL COMMENT '選項鍵',
    value VARCHAR(255) NOT NULL COMMENT '選項值',
    display_name VARCHAR(255) COMMENT '顯示名稱',
    description TEXT COMMENT '選項描述',
    color VARCHAR(20) COMMENT '顏色標籤 (用於 severity 等)',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    UNIQUE KEY unique_category_key (category, key) COMMENT '分類鍵唯一約束',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_active (is_active) COMMENT '啟用狀態索引',
    INDEX idx_sort_order (sort_order) COMMENT '排序索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智慧輸入選項表';

-- 使用者智慧輸入偏好表
CREATE TABLE user_smart_input_preferences (
    id VARCHAR(36) PRIMARY KEY COMMENT '偏好唯一標識',
    user_id VARCHAR(36) NOT NULL COMMENT '人員ID',
    category VARCHAR(100) NOT NULL COMMENT '選項分類',
    frequently_used JSON COMMENT '常用選項列表',
    last_used_at TIMESTAMP NULL COMMENT '最後使用時間',
    usage_count INT DEFAULT 0 COMMENT '使用次數',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '人員外鍵',
    UNIQUE KEY unique_user_category (user_id, category) COMMENT '人員分類唯一約束',
    INDEX idx_user (user_id) COMMENT '人員索引',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_last_used (last_used_at) COMMENT '最後使用索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員智慧輸入偏好表';

-- ===========================================
-- 儀表板統計表 (Dashboard Statistics)
-- ===========================================

-- 儀表板快取表 (用於提升儀表板查詢性能)
CREATE TABLE dashboard_cache (
    id VARCHAR(36) PRIMARY KEY COMMENT '快取唯一標識',
    cache_key VARCHAR(255) NOT NULL COMMENT '快取鍵',
    cache_data JSON NOT NULL COMMENT '快取數據',
    expires_at TIMESTAMP NOT NULL COMMENT '過期時間',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    UNIQUE KEY unique_cache_key (cache_key) COMMENT '快取鍵唯一約束',
    INDEX idx_expires_at (expires_at) COMMENT '過期時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='儀表板快取表';

-- ===========================================
-- 資源指標歷史表 (Resource Metrics History) - 容量規劃核心功能
-- ===========================================

-- 資源指標歷史表
CREATE TABLE resource_metrics_history (
    id VARCHAR(36) PRIMARY KEY COMMENT '歷史記錄唯一標識',
    resource_id VARCHAR(36) NOT NULL COMMENT '資源ID',
    metric_type VARCHAR(50) NOT NULL COMMENT '指標類型: cpu_usage, memory_usage, disk_usage, network_in, network_out等',
    metric_value DECIMAL(10,2) NOT NULL COMMENT '指標數值',
    unit VARCHAR(20) COMMENT '數值單位: %, MB, GB等',
    timestamp TIMESTAMP NOT NULL COMMENT '指標時間戳',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '記錄創建時間',

    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE COMMENT '資源外鍵',
    INDEX idx_resource_metric_time (resource_id, metric_type, timestamp) COMMENT '資源指標時間複合索引',
    INDEX idx_timestamp (timestamp) COMMENT '時間戳索引',
    INDEX idx_metric_type (metric_type) COMMENT '指標類型索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源指標歷史表';

-- ===========================================
-- 事件分析結果表 (Event Analysis Results) - AI分析功能
-- ===========================================

-- 事件分析結果表
CREATE TABLE event_analysis_results (
    id VARCHAR(36) PRIMARY KEY COMMENT '分析結果唯一標識',
    alert_id VARCHAR(36) NOT NULL COMMENT '告警事件ID',
    analysis_type ENUM('rca', 'impact', 'recommendation', 'prediction') NOT NULL COMMENT '分析類型: 根本原因、影響評估、建議措施、預測分析',
    confidence_score DECIMAL(5,2) COMMENT '置信度評分 0-100',
    analysis_result JSON COMMENT '分析結果詳情',
    analyst_type ENUM('ai', 'human', 'hybrid') DEFAULT 'ai' COMMENT '分析類型: AI、人工、混合',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '分析狀態',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE COMMENT '告警事件外鍵',
    INDEX idx_alert_analysis (alert_id, analysis_type) COMMENT '告警分析類型複合索引',
    INDEX idx_confidence (confidence_score) COMMENT '置信度索引',
    INDEX idx_status (status) COMMENT '狀態索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件分析結果表';

-- ===========================================
-- 腳本版本控制表 (Script Versions) - 腳本管理功能
-- ===========================================

-- 腳本版本表
CREATE TABLE script_versions (
    id VARCHAR(36) PRIMARY KEY COMMENT '版本唯一標識',
    script_id VARCHAR(36) NOT NULL COMMENT '腳本ID',
    version VARCHAR(20) NOT NULL COMMENT '版本號',
    content TEXT NOT NULL COMMENT '腳本內容',
    change_log TEXT COMMENT '變更記錄',
    is_active BOOLEAN DEFAULT FALSE COMMENT '是否為活躍版本',
    created_by VARCHAR(36) NOT NULL COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (script_id) REFERENCES automation_scripts(id) ON DELETE CASCADE COMMENT '腳本外鍵',
    FOREIGN KEY (created_by) REFERENCES users(id) COMMENT '創建者外鍵',
    UNIQUE KEY uk_script_version (script_id, version) COMMENT '腳本版本唯一約束',
    INDEX idx_script_active (script_id, is_active) COMMENT '腳本活躍版本索引',
    INDEX idx_created_by (created_by) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='腳本版本表';

-- ===========================================
-- 增強現有表欄位 (Enhanced Existing Tables)
-- ===========================================

-- 增強 dashboards 表 - 支援分類、標籤、使用統計
ALTER TABLE dashboards
ADD COLUMN category VARCHAR(50) COMMENT '儀表板分類',
ADD COLUMN tags JSON COMMENT '標籤列表',
ADD COLUMN access_count INT DEFAULT 0 COMMENT '訪問次數',
ADD COLUMN last_accessed_at TIMESTAMP NULL COMMENT '最後訪問時間',
ADD COLUMN is_default BOOLEAN DEFAULT FALSE COMMENT '是否為預設儀表板',
ADD COLUMN sharing_settings JSON COMMENT '分享設定';

-- 為 dashboards 表添加索引
ALTER TABLE dashboards
ADD INDEX idx_category (category) COMMENT '分類索引',
ADD INDEX idx_is_default (is_default) COMMENT '預設狀態索引',
ADD INDEX idx_access_count (access_count) COMMENT '訪問次數索引';

-- 增強 tag_keys 表 - 支援合規檢查
ALTER TABLE tag_keys
ADD COLUMN is_required BOOLEAN DEFAULT FALSE COMMENT '是否必填',
ADD COLUMN validation_rule VARCHAR(500) COMMENT '驗證規則 (正則表達式等)',
ADD COLUMN compliance_category VARCHAR(50) COMMENT '合規分類',
ADD COLUMN usage_count INT DEFAULT 0 COMMENT '使用次數統計';

-- 為 tag_keys 表添加索引
ALTER TABLE tag_keys
ADD INDEX idx_is_required (is_required) COMMENT '必填狀態索引',
ADD INDEX idx_compliance_category (compliance_category) COMMENT '合規分類索引',
ADD INDEX idx_usage_count (usage_count) COMMENT '使用次數索引';

-- 增強 scripts 表 - 支援執行統計
ALTER TABLE scripts
ADD COLUMN execution_count INT DEFAULT 0 COMMENT '執行次數',
ADD COLUMN last_executed_at TIMESTAMP NULL COMMENT '最後執行時間',
ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0 COMMENT '成功率百分比',
ADD COLUMN dependencies JSON COMMENT '依賴關係列表';

-- 為 scripts 表添加索引
ALTER TABLE scripts
ADD INDEX idx_execution_count (execution_count) COMMENT '執行次數索引',
ADD INDEX idx_last_executed (last_executed_at) COMMENT '最後執行時間索引',
ADD INDEX idx_success_rate (success_rate) COMMENT '成功率索引';

-- ===========================================
-- 會話管理模塊 (Session Management)
-- ===========================================

-- 用戶會話表
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY COMMENT '會話唯一標識',
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID',
    token_hash VARCHAR(255) NOT NULL COMMENT 'Token雜湊值',
    device_info JSON COMMENT '設備信息',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    location VARCHAR(255) COMMENT '登入地點',
    user_agent TEXT COMMENT '用戶代理字符串',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後活動時間',
    expires_at TIMESTAMP NOT NULL COMMENT '過期時間',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活躍',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '用戶外鍵',
    INDEX idx_user_id (user_id) COMMENT '用戶ID索引',
    INDEX idx_token_hash (token_hash) COMMENT 'Token雜湊索引',
    INDEX idx_expires_at (expires_at) COMMENT '過期時間索引',
    INDEX idx_is_active (is_active) COMMENT '活躍狀態索引',
    INDEX idx_last_activity (last_activity) COMMENT '最後活動時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶會話表';

-- ===========================================
-- 通知管理模塊 (Notification Management)
-- ===========================================

-- 通知策略表
CREATE TABLE notification_policies (
    id VARCHAR(36) PRIMARY KEY COMMENT '策略唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '策略名稱',
    description TEXT COMMENT '策略描述',
    trigger_conditions JSON COMMENT '觸發條件',
    channels JSON COMMENT '通知管道配置',
    recipients JSON COMMENT '接收者配置',
    template_id VARCHAR(36) COMMENT '模板ID',
    scheduling JSON COMMENT '排程設定',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal' COMMENT '優先級',
    created_by_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (created_by_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '策略名稱索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_priority (priority) COMMENT '優先級索引',
    INDEX idx_created_by (created_by_id) COMMENT '創建者索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略表';

-- 通知管道表
CREATE TABLE notification_channels (
    id VARCHAR(36) PRIMARY KEY COMMENT '管道唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '管道名稱',
    type ENUM('email', 'slack', 'webhook', 'sms', 'teams', 'discord') NOT NULL COMMENT '管道類型',
    configuration JSON COMMENT '管道配置',
    credentials JSON COMMENT '認證信息',
    status ENUM('active', 'inactive', 'error') DEFAULT 'active' COMMENT '狀態',
    last_test_at TIMESTAMP NULL COMMENT '最後測試時間',
    last_test_result ENUM('success', 'failure') NULL COMMENT '最後測試結果',
    error_message TEXT COMMENT '錯誤信息',
    usage_count INT DEFAULT 0 COMMENT '使用次數',
    created_by_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',

    FOREIGN KEY (created_by_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '管道名稱索引',
    INDEX idx_type (type) COMMENT '管道類型索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_usage_count (usage_count) COMMENT '使用次數索引',
    INDEX idx_deleted_at (deleted_at) COMMENT '軟刪除索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知管道表';

-- 通知歷史表
CREATE TABLE notification_history (
    id VARCHAR(36) PRIMARY KEY COMMENT '通知唯一標識',
    policy_id VARCHAR(36) COMMENT '策略ID',
    channel_id VARCHAR(36) COMMENT '管道ID',
    recipient_type ENUM('user', 'team', 'external') COMMENT '接收者類型',
    recipient_id VARCHAR(36) COMMENT '接收者ID',
    recipient_address VARCHAR(255) COMMENT '接收者地址',
    subject VARCHAR(500) COMMENT '主題',
    content TEXT COMMENT '內容',
    status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending' COMMENT '發送狀態',
    error_message TEXT COMMENT '錯誤信息',
    sent_at TIMESTAMP NULL COMMENT '發送時間',
    delivered_at TIMESTAMP NULL COMMENT '投遞確認時間',
    retry_count INT DEFAULT 0 COMMENT '重試次數',
    metadata JSON COMMENT '元數據',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (policy_id) REFERENCES notification_policies(id) COMMENT '策略外鍵',
    FOREIGN KEY (channel_id) REFERENCES notification_channels(id) COMMENT '管道外鍵',
    INDEX idx_policy_id (policy_id) COMMENT '策略ID索引',
    INDEX idx_channel_id (channel_id) COMMENT '管道ID索引',
    INDEX idx_recipient (recipient_type, recipient_id) COMMENT '接收者索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_sent_at (sent_at) COMMENT '發送時間索引',
    INDEX idx_created_at (created_at) COMMENT '創建時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知歷史表';

-- ===========================================
-- 審計日誌模塊 (Audit Logs)
-- ===========================================

-- 審計日誌表
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '日誌唯一標識',
    user_id VARCHAR(36) COMMENT '操作用戶ID',
    action_type ENUM('create', 'update', 'delete', 'login', 'logout', 'access', 'export') NOT NULL COMMENT '操作類型',
    resource_type VARCHAR(100) COMMENT '資源類型',
    resource_id VARCHAR(36) COMMENT '資源ID',
    resource_name VARCHAR(255) COMMENT '資源名稱',
    details JSON COMMENT '操作詳情',
    before_data JSON COMMENT '操作前數據',
    after_data JSON COMMENT '操作後數據',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用戶代理',
    session_id VARCHAR(36) COMMENT '會話ID',
    result ENUM('success', 'failure', 'partial') DEFAULT 'success' COMMENT '操作結果',
    error_message TEXT COMMENT '錯誤信息',
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low' COMMENT '風險等級',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (user_id) REFERENCES users(id) COMMENT '用戶外鍵',
    INDEX idx_user_id (user_id) COMMENT '用戶ID索引',
    INDEX idx_action_type (action_type) COMMENT '操作類型索引',
    INDEX idx_resource (resource_type, resource_id) COMMENT '資源索引',
    INDEX idx_result (result) COMMENT '操作結果索引',
    INDEX idx_risk_level (risk_level) COMMENT '風險等級索引',
    INDEX idx_created_at (created_at) COMMENT '創建時間索引',
    INDEX idx_ip_address (ip_address) COMMENT 'IP地址索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='審計日誌表';

-- ===========================================
-- 系統設定模塊 (System Settings)
-- ===========================================

-- 系統設定表
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY COMMENT '設定唯一標識',
    category VARCHAR(100) NOT NULL COMMENT '設定分類',
    setting_key VARCHAR(255) NOT NULL COMMENT '設定鍵',
    setting_value TEXT COMMENT '設定值',
    value_type ENUM('string', 'number', 'boolean', 'json', 'encrypted') DEFAULT 'string' COMMENT '值類型',
    description TEXT COMMENT '設定描述',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公開可見',
    is_editable BOOLEAN DEFAULT TRUE COMMENT '是否可編輯',
    validation_rule VARCHAR(500) COMMENT '驗證規則',
    updated_by_id VARCHAR(36) COMMENT '更新者ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (updated_by_id) REFERENCES users(id) COMMENT '更新者外鍵',
    UNIQUE KEY uk_category_key (category, setting_key) COMMENT '分類鍵唯一約束',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_is_public (is_public) COMMENT '公開狀態索引',
    INDEX idx_updated_by (updated_by_id) COMMENT '更新者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系統設定表';

-- ===========================================
-- 容量規劃模塊 (Capacity Planning)
-- ===========================================

-- 容量分析表
CREATE TABLE capacity_analysis (
    id VARCHAR(36) PRIMARY KEY COMMENT '分析唯一標識',
    resource_id VARCHAR(36) COMMENT '資源ID',
    resource_group_id VARCHAR(36) COMMENT '資源群組ID',
    metric_name VARCHAR(100) NOT NULL COMMENT '指標名稱',
    current_usage DECIMAL(10,2) COMMENT '當前使用率',
    predicted_usage DECIMAL(10,2) COMMENT '預測使用率',
    threshold_warning DECIMAL(10,2) DEFAULT 80.00 COMMENT '警告閾值',
    threshold_critical DECIMAL(10,2) DEFAULT 90.00 COMMENT '危險閾值',
    prediction_days INT DEFAULT 30 COMMENT '預測天數',
    confidence_score DECIMAL(5,2) COMMENT '置信度分數',
    recommendations JSON COMMENT '建議內容',
    analysis_data JSON COMMENT '分析數據',
    status ENUM('analyzing', 'completed', 'failed') DEFAULT 'analyzing' COMMENT '分析狀態',
    created_by_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (resource_id) REFERENCES resources(id) COMMENT '資源外鍵',
    FOREIGN KEY (resource_group_id) REFERENCES resource_groups(id) COMMENT '資源群組外鍵',
    FOREIGN KEY (created_by_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_resource_id (resource_id) COMMENT '資源ID索引',
    INDEX idx_resource_group_id (resource_group_id) COMMENT '資源群組ID索引',
    INDEX idx_metric_name (metric_name) COMMENT '指標名稱索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_created_at (created_at) COMMENT '創建時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='容量分析表';

-- ===========================================
-- 執行日誌模塊 (Execution Logs)
-- ===========================================

-- 執行日誌表
CREATE TABLE execution_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '日誌唯一標識',
    script_id VARCHAR(36) COMMENT '腳本ID',
    schedule_id VARCHAR(36) COMMENT '排程ID',
    trigger_type ENUM('manual', 'scheduled', 'event', 'api') NOT NULL COMMENT '觸發類型',
    triggered_by_id VARCHAR(36) COMMENT '觸發者ID',
    status ENUM('pending', 'running', 'success', 'failed', 'cancelled', 'timeout') DEFAULT 'pending' COMMENT '執行狀態',
    start_time TIMESTAMP NULL COMMENT '開始時間',
    end_time TIMESTAMP NULL COMMENT '結束時間',
    duration_seconds INT COMMENT '執行時長(秒)',
    exit_code INT COMMENT '退出代碼',
    stdout_log LONGTEXT COMMENT '標準輸出日誌',
    stderr_log LONGTEXT COMMENT '錯誤輸出日誌',
    input_parameters JSON COMMENT '輸入參數',
    output_data JSON COMMENT '輸出數據',
    resource_usage JSON COMMENT '資源使用情況',
    error_details JSON COMMENT '錯誤詳情',
    retry_count INT DEFAULT 0 COMMENT '重試次數',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (script_id) REFERENCES automation_scripts(id) COMMENT '腳本外鍵',
    FOREIGN KEY (triggered_by_id) REFERENCES users(id) COMMENT '觸發者外鍵',
    INDEX idx_script_id (script_id) COMMENT '腳本ID索引',
    INDEX idx_schedule_id (schedule_id) COMMENT '排程ID索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_trigger_type (trigger_type) COMMENT '觸發類型索引',
    INDEX idx_start_time (start_time) COMMENT '開始時間索引',
    INDEX idx_created_at (created_at) COMMENT '創建時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='執行日誌表';

-- ===========================================
-- 性能優化：複合索引和分區策略
-- ===========================================

-- 為審計日誌表添加複合索引（高頻查詢場景）
ALTER TABLE audit_logs
ADD INDEX idx_user_action_time (user_id, action_type, created_at) COMMENT '用戶操作時間複合索引',
ADD INDEX idx_resource_action_time (resource_type, resource_id, created_at) COMMENT '資源操作時間複合索引';

-- 為通知歷史表添加複合索引
ALTER TABLE notification_history
ADD INDEX idx_status_created (status, created_at) COMMENT '狀態創建時間複合索引',
ADD INDEX idx_recipient_status (recipient_type, recipient_id, status) COMMENT '接收者狀態複合索引';

-- 為執行日誌表添加複合索引
ALTER TABLE execution_logs
ADD INDEX idx_script_status_time (script_id, status, start_time) COMMENT '腳本狀態時間複合索引',
ADD INDEX idx_trigger_status_time (trigger_type, status, created_at) COMMENT '觸發狀態時間複合索引';

-- ===========================================
-- 數據保留策略和清理任務
-- ===========================================

-- 創建數據保留策略表
CREATE TABLE data_retention_policies (
    id VARCHAR(36) PRIMARY KEY COMMENT '策略唯一標識',
    table_name VARCHAR(100) NOT NULL COMMENT '表名',
    retention_days INT NOT NULL COMMENT '保留天數',
    date_column VARCHAR(100) NOT NULL COMMENT '日期列名',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    last_cleanup_at TIMESTAMP NULL COMMENT '最後清理時間',
    cleanup_batch_size INT DEFAULT 1000 COMMENT '清理批次大小',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    UNIQUE KEY uk_table_name (table_name) COMMENT '表名唯一約束',
    INDEX idx_is_enabled (is_enabled) COMMENT '啟用狀態索引',
    INDEX idx_last_cleanup (last_cleanup_at) COMMENT '最後清理時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='數據保留策略表';

-- 插入預設的數據保留策略
INSERT INTO data_retention_policies (id, table_name, retention_days, date_column, is_enabled) VALUES
(UUID(), 'audit_logs', 365, 'created_at', TRUE),
(UUID(), 'notification_history', 90, 'created_at', TRUE),
(UUID(), 'execution_logs', 180, 'created_at', TRUE),
(UUID(), 'user_sessions', 30, 'created_at', TRUE),
(UUID(), 'alerts', 180, 'created_at', TRUE);

-- ===========================================
-- 視圖定義 (Views for Common Queries)
-- ===========================================

-- 用戶活動統計視圖
CREATE VIEW v_user_activity_stats AS
SELECT
    u.id as user_id,
    u.username,
    u.name,
    COUNT(DISTINCT s.id) as active_sessions,
    MAX(s.last_activity) as last_activity,
    COUNT(DISTINCT DATE(al.created_at)) as active_days_last_30,
    COUNT(al.id) as total_actions_last_30
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = TRUE
LEFT JOIN audit_logs al ON u.id = al.user_id AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.name;

-- 資源健康狀態統計視圖
CREATE VIEW v_resource_health_stats AS
SELECT
    rg.id as group_id,
    rg.name as group_name,
    COUNT(r.id) as total_resources,
    SUM(CASE WHEN r.status = 'healthy' THEN 1 ELSE 0 END) as healthy_count,
    SUM(CASE WHEN r.status = 'warning' THEN 1 ELSE 0 END) as warning_count,
    SUM(CASE WHEN r.status = 'critical' THEN 1 ELSE 0 END) as critical_count,
    ROUND(SUM(CASE WHEN r.status = 'healthy' THEN 1 ELSE 0 END) * 100.0 / COUNT(r.id), 2) as health_percentage
FROM resource_groups rg
LEFT JOIN resource_group_members rgm ON rg.id = rgm.group_id
LEFT JOIN resources r ON rgm.resource_id = r.id AND r.deleted_at IS NULL
WHERE rg.deleted_at IS NULL
GROUP BY rg.id, rg.name;

-- 事件處理效率統計視圖
CREATE VIEW v_event_processing_stats AS
SELECT
    DATE(a.created_at) as event_date,
    COUNT(*) as total_events,
    SUM(CASE WHEN a.status = 'resolved' THEN 1 ELSE 0 END) as resolved_events,
    AVG(CASE
        WHEN a.ends_at IS NOT NULL AND a.starts_at IS NOT NULL
        THEN TIMESTAMPDIFF(MINUTE, a.starts_at, a.ends_at)
        ELSE NULL
    END) as avg_resolution_minutes,
    AVG(CASE
        WHEN a.acknowledged_at IS NOT NULL AND a.starts_at IS NOT NULL
        THEN TIMESTAMPDIFF(MINUTE, a.starts_at, a.acknowledged_at)
        ELSE NULL
    END) as avg_acknowledgment_minutes
FROM alerts a
WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(a.created_at)
ORDER BY event_date DESC;

-- 啟用外鍵約束
SET FOREIGN_KEY_CHECKS = 1;