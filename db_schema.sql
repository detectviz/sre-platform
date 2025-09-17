-- SRE 平台數據庫架構
-- 基於前端原型分析設計的完整數據庫結構
-- 生成時間: 2025年9月

-- 使用 UTF8MB4 字符集支持完整的 Unicode
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 用戶與權限管理模塊 (Users & Permissions)
-- ===========================================

-- 用戶表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY COMMENT '用戶唯一標識',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用戶名',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '電子郵件',
    password_hash VARCHAR(255) NOT NULL COMMENT '密碼哈希',
    name VARCHAR(100) NOT NULL COMMENT '顯示名稱',
    avatar VARCHAR(500) COMMENT '頭像URL',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending' COMMENT '用戶狀態',
    last_login TIMESTAMP NULL COMMENT '最後登入時間',
    login_count INT DEFAULT 0 COMMENT '登入次數',
    preferences JSON COMMENT '用戶偏好設定',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    INDEX idx_username (username) COMMENT '用戶名索引',
    INDEX idx_email (email) COMMENT '郵箱索引',
    INDEX idx_status (status) COMMENT '狀態索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶表';

-- 團隊表
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY COMMENT '團隊唯一標識',
    name VARCHAR(100) NOT NULL COMMENT '團隊名稱',
    description TEXT COMMENT '團隊描述',
    owner_id VARCHAR(36) COMMENT '團隊負責人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (owner_id) REFERENCES users(id) COMMENT '負責人外鍵',
    INDEX idx_name (name) COMMENT '團隊名稱索引',
    INDEX idx_owner (owner_id) COMMENT '負責人索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊表';

-- 角色表
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY COMMENT '角色唯一標識',
    name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名稱',
    description TEXT COMMENT '角色描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    INDEX idx_name (name) COMMENT '角色名稱索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 權限表
CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY COMMENT '權限唯一標識',
    action VARCHAR(100) NOT NULL COMMENT '操作類型',
    resource VARCHAR(100) NOT NULL COMMENT '資源類型',
    description TEXT COMMENT '權限描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    UNIQUE KEY unique_action_resource (action, resource) COMMENT '操作資源唯一約束'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='權限表';

-- 用戶團隊關聯表
CREATE TABLE user_teams (
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID',
    team_id VARCHAR(36) NOT NULL COMMENT '團隊ID',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',

    PRIMARY KEY (user_id, team_id) COMMENT '複合主鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '用戶外鍵',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE COMMENT '團隊外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶團隊關聯表';

-- 用戶角色關聯表
CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID',
    role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配時間',

    PRIMARY KEY (user_id, role_id) COMMENT '複合主鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '用戶外鍵',
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE COMMENT '角色外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶角色關聯表';

-- 角色權限關聯表
CREATE TABLE role_permissions (
    role_id VARCHAR(36) NOT NULL COMMENT '角色ID',
    permission_id VARCHAR(36) NOT NULL COMMENT '權限ID',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授予時間',

    PRIMARY KEY (role_id, permission_id) COMMENT '複合主鍵',
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE COMMENT '角色外鍵',
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE COMMENT '權限外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色權限關聯表';

-- 團隊訂閱者表
CREATE TABLE team_subscribers (
    team_id VARCHAR(36) NOT NULL COMMENT '團隊ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '訂閱時間',

    PRIMARY KEY (team_id, user_id) COMMENT '複合主鍵',
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE COMMENT '團隊外鍵',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '用戶外鍵'
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

    FOREIGN KEY (team_id) REFERENCES teams(id) COMMENT '團隊外鍵',
    INDEX idx_name (name) COMMENT '資源名稱索引',
    INDEX idx_type (type) COMMENT '資源類型索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_team (team_id) COMMENT '團隊索引',
    INDEX idx_ip (ip_address) COMMENT 'IP地址索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源表';

-- 標籤鍵表
CREATE TABLE tag_keys (
    id VARCHAR(36) PRIMARY KEY COMMENT '標籤鍵唯一標識',
    key VARCHAR(100) UNIQUE NOT NULL COMMENT '標籤鍵',
    display_name VARCHAR(255) NOT NULL COMMENT '顯示名稱',
    description TEXT COMMENT '標籤描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    INDEX idx_key (key) COMMENT '標籤鍵索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤鍵表';

-- 標籤值表
CREATE TABLE tag_values (
    id VARCHAR(36) PRIMARY KEY COMMENT '標籤值唯一標識',
    tag_key_id VARCHAR(36) NOT NULL COMMENT '標籤鍵ID',
    value VARCHAR(255) NOT NULL COMMENT '標籤值',
    display_name VARCHAR(255) COMMENT '顯示名稱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (tag_key_id) REFERENCES tag_keys(id) ON DELETE CASCADE COMMENT '標籤鍵外鍵',
    UNIQUE KEY unique_tag_value (tag_key_id, value) COMMENT '標籤鍵值唯一約束',
    INDEX idx_value (value) COMMENT '標籤值索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤值表';

-- 資源標籤關聯表
CREATE TABLE resource_tags (
    resource_id VARCHAR(36) NOT NULL COMMENT '資源ID',
    tag_value_id VARCHAR(36) NOT NULL COMMENT '標籤值ID',
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '標籤時間',

    PRIMARY KEY (resource_id, tag_value_id) COMMENT '複合主鍵',
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE COMMENT '資源外鍵',
    FOREIGN KEY (tag_value_id) REFERENCES tag_values(id) ON DELETE CASCADE COMMENT '標籤值外鍵'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源標籤關聯表';

-- 資源群組表
CREATE TABLE resource_groups (
    id VARCHAR(36) PRIMARY KEY COMMENT '群組唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '群組名稱',
    description TEXT COMMENT '群組描述',
    team_id VARCHAR(36) COMMENT '負責團隊ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (team_id) REFERENCES teams(id) COMMENT '團隊外鍵',
    INDEX idx_name (name) COMMENT '群組名稱索引',
    INDEX idx_team (team_id) COMMENT '團隊索引'
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

-- 告警規則表
CREATE TABLE alert_rules (
    id VARCHAR(36) PRIMARY KEY COMMENT '規則唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '規則名稱',
    description TEXT COMMENT '規則描述',
    target VARCHAR(500) NOT NULL COMMENT '監控目標',
    resource_tags JSON COMMENT '資源標籤匹配條件',
    conditions JSON COMMENT '觸發條件',
    notifications JSON COMMENT '通知配置',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    severity ENUM('critical', 'warning', 'info') DEFAULT 'warning' COMMENT '默認嚴重性',
    group_by JSON COMMENT '分組字段',
    labels JSON COMMENT '自定義標籤',
    annotations JSON COMMENT '自定義註解',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '規則名稱索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='告警規則表';

-- 靜音規則表
CREATE TABLE silence_rules (
    id VARCHAR(36) PRIMARY KEY COMMENT '靜音規則唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '規則名稱',
    description TEXT COMMENT '規則描述',
    type ENUM('single', 'recurring') DEFAULT 'single' COMMENT '規則類型',
    matchers JSON COMMENT '匹配條件',
    starts_at TIMESTAMP NOT NULL COMMENT '開始時間',
    ends_at TIMESTAMP NOT NULL COMMENT '結束時間',
    created_by_id VARCHAR(36) COMMENT '創建者ID',
    comment TEXT COMMENT '註釋',
    status ENUM('active', 'expired', 'pending') DEFAULT 'pending' COMMENT '狀態',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (created_by_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '規則名稱索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_created_by (created_by_id) COMMENT '創建者索引',
    INDEX idx_time_range (starts_at, ends_at) COMMENT '時間範圍索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='靜音規則表';

-- 告警事件表
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY COMMENT '告警唯一標識',
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
CREATE TABLE automation_scripts (
    id VARCHAR(36) PRIMARY KEY COMMENT '腳本唯一標識',
    name VARCHAR(255) NOT NULL COMMENT '腳本名稱',
    type ENUM('python', 'bash', 'powershell') DEFAULT 'python' COMMENT '腳本類型',
    description TEXT COMMENT '腳本描述',
    content TEXT NOT NULL COMMENT '腳本內容',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    category ENUM('deployment', 'maintenance', 'monitoring') DEFAULT 'maintenance' COMMENT '分類',
    params JSON COMMENT '參數定義',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '狀態',
    execution_count INT DEFAULT 0 COMMENT '執行次數',
    last_executed_at TIMESTAMP NULL COMMENT '最後執行時間',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '腳本名稱索引',
    INDEX idx_type (type) COMMENT '腳本類型索引',
    INDEX idx_category (category) COMMENT '分類索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自動化腳本表';

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

    FOREIGN KEY (script_id) REFERENCES automation_scripts(id) COMMENT '腳本外鍵',
    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_name (name) COMMENT '任務名稱索引',
    INDEX idx_script (script_id) COMMENT '腳本索引',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引',
    INDEX idx_next_run (next_run_at) COMMENT '下次執行索引'
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
    channels JSON NOT NULL COMMENT '通知管道列表',
    escalation JSON COMMENT '升級策略',
    enabled BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    creator_id VARCHAR(36) COMMENT '創建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (creator_id) REFERENCES users(id) COMMENT '創建者外鍵',
    INDEX idx_enabled (enabled) COMMENT '啟用狀態索引',
    INDEX idx_creator (creator_id) COMMENT '創建者索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略表';

-- 通知歷史記錄表
CREATE TABLE notification_history (
    id VARCHAR(36) PRIMARY KEY COMMENT '通知記錄唯一標識',
    alert_id VARCHAR(36) COMMENT '關聯告警ID',
    channel_id VARCHAR(36) COMMENT '使用的管道ID',
    template_id VARCHAR(36) COMMENT '使用的模板ID',
    policy_id VARCHAR(36) COMMENT '使用的策略ID',
    recipient VARCHAR(500) NOT NULL COMMENT '接收者',
    subject VARCHAR(500) COMMENT '通知主題',
    content TEXT NOT NULL COMMENT '通知內容',
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending' COMMENT '發送狀態',
    error_message TEXT COMMENT '錯誤信息',
    sent_at TIMESTAMP NULL COMMENT '發送時間',
    delivered_at TIMESTAMP NULL COMMENT '送達時間',
    retry_count INT DEFAULT 0 COMMENT '重試次數',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',

    FOREIGN KEY (alert_id) REFERENCES alerts(id) COMMENT '告警外鍵',
    FOREIGN KEY (channel_id) REFERENCES notification_channels(id) COMMENT '管道外鍵',
    FOREIGN KEY (template_id) REFERENCES notification_templates(id) COMMENT '模板外鍵',
    FOREIGN KEY (policy_id) REFERENCES notification_policies(id) COMMENT '策略外鍵',
    INDEX idx_alert (alert_id) COMMENT '告警索引',
    INDEX idx_channel (channel_id) COMMENT '管道索引',
    INDEX idx_status (status) COMMENT '狀態索引',
    INDEX idx_sent_at (sent_at) COMMENT '發送時間索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知歷史記錄表';

-- ===========================================
-- 審計日誌模塊 (Audit Logs)
-- ===========================================

-- 審計日誌表
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY COMMENT '審計日誌唯一標識',
    user_id VARCHAR(36) COMMENT '操作用戶ID',
    action VARCHAR(100) NOT NULL COMMENT '操作類型',
    resource_type VARCHAR(100) NOT NULL COMMENT '資源類型',
    resource_id VARCHAR(36) COMMENT '資源ID',
    old_values JSON COMMENT '修改前的值',
    new_values JSON COMMENT '修改後的值',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用戶代理',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作時間',

    FOREIGN KEY (user_id) REFERENCES users(id) COMMENT '用戶外鍵',
    INDEX idx_user (user_id) COMMENT '用戶索引',
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

-- 用戶偏好設定表
CREATE TABLE user_preferences (
    id VARCHAR(36) PRIMARY KEY COMMENT '偏好設定唯一標識',
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID',
    category VARCHAR(100) NOT NULL COMMENT '設定分類',
    key VARCHAR(255) NOT NULL COMMENT '設定鍵',
    value JSON NOT NULL COMMENT '設定值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE COMMENT '用戶外鍵',
    UNIQUE KEY unique_user_category_key (user_id, category, key) COMMENT '用戶分類鍵唯一約束',
    INDEX idx_user (user_id) COMMENT '用戶索引',
    INDEX idx_category (category) COMMENT '分類索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶偏好設定表';

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

-- 啟用外鍵約束
SET FOREIGN_KEY_CHECKS = 1;