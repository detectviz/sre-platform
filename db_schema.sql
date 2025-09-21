-- SRE 平台數據庫架構 v3.0
-- 本文件根據 pages.md 的全面分析進行了重構與標準化。
-- 它移除了所有重複定義，修正了外鍵關聯，並新增了支援核心功能所需的資料表。
-- 更新時間: 2025-09-18

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- 身份與存取管理 (Users & Permissions)
-- ===========================================

-- 人員表 (與 Keycloak 同步)
CREATE TABLE `users` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '人員唯一標識 (同步 Keycloak UUID)',
    `username` VARCHAR(255) UNIQUE NOT NULL COMMENT '登入用名 (同步 Keycloak)',
    `email` VARCHAR(255) UNIQUE NOT NULL COMMENT '電子郵件 (同步 Keycloak)',
    `name` VARCHAR(100) NOT NULL COMMENT '顯示名稱',
    `avatar_url` VARCHAR(500) COMMENT '頭像URL',
    `last_login_at` TIMESTAMP NULL COMMENT '最後登入時間',
    `preferences` JSON COMMENT '人員平台偏好設定',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '人員是否在平台內啟用 (非 Keycloak 狀態)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',
    INDEX `idx_username` (`username`),
    INDEX `idx_email` (`email`),
    INDEX `idx_is_active` (`is_active`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員表 (Keycloak 代理)';

-- 團隊表
CREATE TABLE `teams` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '團隊唯一標識',
    `name` VARCHAR(100) UNIQUE NOT NULL COMMENT '團隊名稱',
    `description` TEXT COMMENT '團隊描述',
    `leader_id` VARCHAR(36) COMMENT '團隊負責人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',
    FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_name` (`name`),
    INDEX `idx_leader_id` (`leader_id`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊表';

-- 角色表
CREATE TABLE `roles` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '角色唯一標識',
    `name` VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名稱',
    `description` TEXT COMMENT '角色描述',
    `is_built_in` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否為內建角色 (不可刪除)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',
    INDEX `idx_name` (`name`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 人員團隊關聯表
CREATE TABLE `user_teams` (
    `user_id` VARCHAR(36) NOT NULL COMMENT '人員ID',
    `team_id` VARCHAR(36) NOT NULL COMMENT '團隊ID',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',
    PRIMARY KEY (`user_id`, `team_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員團隊關聯表';

-- 人員角色關聯表
CREATE TABLE `user_roles` (
    `user_id` VARCHAR(36) NOT NULL COMMENT '人員ID',
    `role_id` VARCHAR(36) NOT NULL COMMENT '角色ID',
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配時間',
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人員角色關聯表';

-- 角色權限關聯表
CREATE TABLE `role_permissions` (
    `role_id` VARCHAR(36) NOT NULL COMMENT '角色ID',
    `permission_key` VARCHAR(255) NOT NULL COMMENT '權限鍵 (定義於程式碼中)',
    `granted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授予時間',
    PRIMARY KEY (`role_id`, `permission_key`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色權限關聯表';

-- 團隊訂閱者表 (僅接收通知)
CREATE TABLE `team_subscribers` (
    `team_id` VARCHAR(36) NOT NULL COMMENT '團隊ID',
    `user_id` VARCHAR(36) NOT NULL COMMENT '人員ID',
    `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '訂閱時間',
    PRIMARY KEY (`team_id`, `user_id`),
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='團隊訂閱者表';

-- ===========================================
-- 資源管理 (Resources Management)
-- ===========================================

-- 資源表 (CMDB核心)
CREATE TABLE `resources` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '資源唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '資源名稱',
    `type` ENUM('server', 'database', 'cache', 'gateway', 'service') NOT NULL COMMENT '資源類型',
    `status` ENUM('healthy', 'warning', 'critical', 'unknown') DEFAULT 'unknown' COMMENT '健康狀態',
    `ip_address` VARCHAR(45) COMMENT 'IP地址',
    `location` VARCHAR(255) COMMENT '位置資訊',
    `team_id` VARCHAR(36) COMMENT '負責團隊ID',
    `description` TEXT COMMENT '資源描述',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '軟刪除時間戳',
    FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL,
    INDEX `idx_name` (`name`),
    INDEX `idx_type` (`type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_team` (`team_id`),
    INDEX `idx_ip` (`ip_address`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源表 (CMDB核心)';

-- 資源群組表
CREATE TABLE `resource_groups` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '群組唯一標識',
    `name` VARCHAR(255) UNIQUE NOT NULL COMMENT '群組名稱',
    `description` TEXT COMMENT '群組描述',
    `type` ENUM('static', 'dynamic') NOT NULL DEFAULT 'static' COMMENT '群組類型 (靜態或動態)',
    `rules` JSON COMMENT '動態群組的標籤匹配規則',
    `responsible_team_id` VARCHAR(36) COMMENT '負責團隊ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`responsible_team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL,
    INDEX `idx_name` (`name`),
    INDEX `idx_team_id` (`responsible_team_id`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源群組表';

-- 資源群組成員關聯表 (用於靜態群組)
CREATE TABLE `resource_group_members` (
    `group_id` VARCHAR(36) NOT NULL COMMENT '群組ID',
    `resource_id` VARCHAR(36) NOT NULL COMMENT '資源ID',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入時間',
    PRIMARY KEY (`group_id`, `resource_id`),
    FOREIGN KEY (`group_id`) REFERENCES `resource_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源群組成員關聯表';

-- ===========================================
-- 標籤治理 (Tag Governance) - 平台核心功能
-- ===========================================

-- 標籤鍵定義表
CREATE TABLE `tag_keys` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '標籤鍵唯一標識',
    `key_name` VARCHAR(100) UNIQUE NOT NULL COMMENT '標籤鍵',
    `display_name` VARCHAR(100) NOT NULL COMMENT '標籤顯示名稱',
    `description` TEXT COMMENT '標籤描述',
    `is_required` BOOLEAN DEFAULT FALSE COMMENT '是否必填',
    `validation_regex` VARCHAR(255) COMMENT '值的驗證正則表達式',
    `category` VARCHAR(50) NOT NULL DEFAULT 'uncategorized' COMMENT '標籤分類 (對應標籤治理介面分類)',
    `compliance_category` VARCHAR(50) COMMENT '合規分類',
    `total_usage` INT DEFAULT 0 COMMENT '標籤被套用的總次數',
    `enforcement_level` ENUM('advisory', 'warning', 'blocking') DEFAULT 'advisory' COMMENT '強制等級',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_key_name` (`key_name`),
    INDEX `idx_category` (`category`),
    INDEX `idx_is_required` (`is_required`),
    INDEX `idx_compliance_category` (`compliance_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤治理 - 標籤鍵定義';

-- 標籤允許值表
CREATE TABLE `tag_allowed_values` (
    `id` VARCHAR(36) PRIMARY KEY,
    `tag_key_id` VARCHAR(36) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `display_name` VARCHAR(255) NOT NULL COMMENT '標籤值顯示名稱',
    `color` VARCHAR(7) COMMENT 'UI 顯示顏色',
    `usage_count` INT DEFAULT 0 COMMENT '標籤值使用次數',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (`tag_key_id`) REFERENCES `tag_keys`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_tag_value` (`tag_key_id`, `value`),
    INDEX `idx_usage_count` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤治理 - 標籤允許值';

-- 資源與標籤的實際關聯表
CREATE TABLE `resource_tags` (
    `resource_id` VARCHAR(36) NOT NULL COMMENT '資源ID',
    `tag_key` VARCHAR(100) NOT NULL,
    `tag_value` VARCHAR(255) NOT NULL,
    `tagged_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`resource_id`, `tag_key`),
    FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
    INDEX `idx_tag_key_value` (`tag_key`, `tag_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源標籤關聯表';

-- 標籤合規性違規記錄表
CREATE TABLE `tag_compliance_violations` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '違規記錄唯一標識',
    `resource_id` VARCHAR(36) NOT NULL COMMENT '資源ID',
    `resource_name` VARCHAR(255) COMMENT '資源名稱',
    `violation_type` ENUM('missing_required', 'invalid_value', 'unknown_key') NOT NULL COMMENT '違規類型',
    `tag_key` VARCHAR(100) COMMENT '相關標籤鍵',
    `expected_value` VARCHAR(255) COMMENT '預期值',
    `actual_value` VARCHAR(255) COMMENT '實際值',
    `severity` ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT '嚴重程度',
    `detected_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '檢測時間',
    `resolved_at` TIMESTAMP NULL COMMENT '解決時間',
    FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
    INDEX `idx_resource_id` (`resource_id`),
    INDEX `idx_violation_type` (`violation_type`),
    INDEX `idx_tag_key` (`tag_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='標籤合規性違規記錄表';

-- ===========================================
-- 儀表板與洞察 (Dashboards & Insights)
-- ===========================================

-- 儀表板主表
CREATE TABLE `dashboards` (
    `id` VARCHAR(64) PRIMARY KEY COMMENT '儀表板唯一標識 (slug 或 UUID)',
    `name` VARCHAR(255) NOT NULL COMMENT '儀表板名稱',
    `description` TEXT COMMENT '儀表板描述',
    `category` ENUM('infrastructure', 'business', 'operations', 'automation', 'custom') NOT NULL COMMENT '儀表板分類',
    `owner` VARCHAR(255) COMMENT '負責團隊或擁有者',
    `is_default` BOOLEAN DEFAULT FALSE COMMENT '是否為預設儀表板',
    `is_featured` BOOLEAN DEFAULT FALSE COMMENT '是否為精選儀表板',
    `viewers_count` INT DEFAULT 0 COMMENT '瀏覽次數',
    `favorites_count` INT DEFAULT 0 COMMENT '收藏數',
    `panel_count` INT DEFAULT 0 COMMENT '包含面板數量',
    `data_sources` JSON COMMENT '資料來源列表',
    `thumbnail_url` VARCHAR(500) COMMENT '預覽縮圖 URL',
    `target_page_key` VARCHAR(100) COMMENT '前端導覽對應鍵值',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_category` (`category`),
    INDEX `idx_owner` (`owner`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='儀表板定義';

-- 基礎設施統計快照
CREATE TABLE `infrastructure_snapshots` (
    `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '快照 ID',
    `captured_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '快照時間',
    `server_count` INT DEFAULT 0 COMMENT '伺服器總數',
    `database_count` INT DEFAULT 0 COMMENT '資料庫數量',
    `container_count` INT DEFAULT 0 COMMENT '容器數量',
    `service_count` INT DEFAULT 0 COMMENT '服務數量',
    `server_trend` INT DEFAULT 0 COMMENT '伺服器趨勢(較上期)',
    `database_trend` INT DEFAULT 0 COMMENT '資料庫趨勢',
    `container_trend` INT DEFAULT 0 COMMENT '容器趨勢',
    `service_trend` INT DEFAULT 0 COMMENT '服務趨勢',
    INDEX `idx_captured_at` (`captured_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='基礎設施統計快照';

-- 資源使用率明細
CREATE TABLE `resource_usage_metrics` (
    `id` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    `snapshot_id` BIGINT UNSIGNED NOT NULL COMMENT '對應快照 ID',
    `resource_id` VARCHAR(36) COMMENT '資源 ID (可為外部來源)',
    `resource_name` VARCHAR(255) NOT NULL COMMENT '資源名稱',
    `resource_type` VARCHAR(100) COMMENT '資源類型',
    `usage_percent` DECIMAL(5,2) NOT NULL COMMENT '使用率百分比 (0-100)',
    `status` ENUM('healthy', 'warning', 'critical') NOT NULL DEFAULT 'healthy' COMMENT '健康狀態',
    `captured_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '紀錄時間',
    FOREIGN KEY (`snapshot_id`) REFERENCES `infrastructure_snapshots`(`id`) ON DELETE CASCADE,
    INDEX `idx_snapshot` (`snapshot_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='資源使用率明細';

-- AI 風險預測記錄
CREATE TABLE `ai_risk_predictions` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '預測記錄 ID',
    `resource_id` VARCHAR(36) COMMENT '關聯資源ID',
    `resource_name` VARCHAR(255) NOT NULL COMMENT '資源名稱',
    `risk_level` ENUM('low', 'medium', 'high') NOT NULL COMMENT '風險等級',
    `prediction` TEXT NOT NULL COMMENT '預測描述',
    `impact` TEXT COMMENT '可能影響',
    `recommendation` TEXT COMMENT '建議行動',
    `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '產出時間',
    INDEX `idx_risk_level` (`risk_level`),
    INDEX `idx_generated_at` (`generated_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI 風險預測記錄';

-- ===========================================
-- 事件管理 (Event Management)
-- ===========================================

-- 事故表 (高層級，由多個事件組成)
CREATE TABLE `incidents` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '事故唯一標識',
    `title` VARCHAR(255) NOT NULL COMMENT '事故標題',
    `status` ENUM('investigating', 'identified', 'monitoring', 'resolved') NOT NULL,
    `severity` ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    `assignee_id` VARCHAR(36) COMMENT '事故處理人ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事故表';

-- 事件表 (Events)
CREATE TABLE `events` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '事件唯一標識',
    `incident_id` VARCHAR(36) COMMENT '所屬事故ID (若已合併)',
    `summary` VARCHAR(500) NOT NULL COMMENT '事件摘要',
    `description` TEXT COMMENT '事件描述',
    `severity` ENUM('critical', 'warning', 'info') DEFAULT 'warning' COMMENT '嚴重性',
    `status` ENUM('new', 'acknowledged', 'resolved', 'silenced') DEFAULT 'new' COMMENT '狀態 (Grafana firing 對應 new)',
    `source` VARCHAR(100) COMMENT '事件來源 (e.g. Prometheus)',
    `resource_id` VARCHAR(36) COMMENT '相關資源ID',
    `rule_id` VARCHAR(255) COMMENT '觸發規則的UID (來自Grafana)',
    `labels` JSON COMMENT '告警標籤',
    `annotations` JSON COMMENT '告警註解',
    `starts_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '開始時間',
    `ends_at` TIMESTAMP NULL COMMENT '結束時間',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE SET NULL,
    INDEX `idx_incident_id` (`incident_id`),
    INDEX `idx_severity` (`severity`),
    INDEX `idx_status` (`status`),
    INDEX `idx_resource` (`resource_id`),
    INDEX `idx_time_range` (`starts_at`, `ends_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件表';

-- 事件歷史記錄表
CREATE TABLE `event_histories` (
    `id` VARCHAR(36) PRIMARY KEY,
    `event_id` VARCHAR(36) NOT NULL,
    `type` ENUM('SYSTEM_STATE_CHANGE', 'USER_COMMENT', 'AUTOMATION_RUN', 'ASSIGNEE_CHANGE') NOT NULL COMMENT '歷史記錄類型',
    `actor` VARCHAR(255) NOT NULL COMMENT '操作者 (e.g. system, user:uuid, rule:uuid)',
    `content` TEXT COMMENT '內容 (支援Markdown)',
    `metadata` JSON COMMENT '結構化元數據 (如附件, 執行ID)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    INDEX `idx_event_id` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件處理歷史記錄表';

-- 事件關聯表 (預計算)
CREATE TABLE `event_correlations` (
    `event_id_a` VARCHAR(36) NOT NULL,
    `event_id_b` VARCHAR(36) NOT NULL,
    `type` ENUM('TOPOLOGY_DOWNSTREAM', 'TOPOLOGY_UPSTREAM', 'TIME', 'CONTENT', 'AI') NOT NULL COMMENT '關聯類型',
    `confidence` FLOAT NOT NULL COMMENT '置信度',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`event_id_a`, `event_id_b`, `type`),
    FOREIGN KEY (`event_id_a`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`event_id_b`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件關聯表 (預計算)';

-- 週期性靜音規則表 (平台核心功能)
CREATE TABLE `recurring_silence_rules` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '靜音規則唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '規則名稱',
    `description` TEXT COMMENT '規則描述',
    `matchers` JSON NOT NULL COMMENT 'Grafana 標籤匹配條件',
    `cron_expression` VARCHAR(100) NOT NULL COMMENT 'CRON 表達式',
    `duration_minutes` INT NOT NULL COMMENT '每次靜音持續時間(分鐘)',
    `timezone` VARCHAR(50) DEFAULT 'UTC' COMMENT 'CRON 表達式使用的時區',
    `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否啟用',
    `creator_id` VARCHAR(36) COMMENT '創建者ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_is_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='週期性靜音規則表';

-- ===========================================
-- 自動化 (Automation)
-- ===========================================

-- 自動化腳本元數據表 (內容儲存於 Git)
CREATE TABLE `automation_scripts` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '腳本唯一標識',
    `name` VARCHAR(255) UNIQUE NOT NULL COMMENT '腳本名稱',
    `type` ENUM('python', 'bash', 'powershell') DEFAULT 'python' COMMENT '腳本類型',
    `description` TEXT COMMENT '腳本描述',
    `creator_id` VARCHAR(36) COMMENT '創建者ID',
    `category` ENUM('deployment', 'maintenance', 'monitoring') DEFAULT 'maintenance' COMMENT '分類',
    `parameters_definition` JSON COMMENT '參數定義',
    `git_repo_url` VARCHAR(500) NOT NULL COMMENT 'Git 倉庫 URL',
    `commit_hash` VARCHAR(40) NOT NULL COMMENT '當前版本的 Commit Hash',
    `version` VARCHAR(20) NOT NULL COMMENT '當前版本號',
    `is_enabled` BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    `execution_count` INT NOT NULL DEFAULT 0 COMMENT '累積執行次數',
    `last_executed_at` TIMESTAMP NULL COMMENT '最後執行時間',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_deleted_at` (`deleted_at`),
    INDEX `idx_last_executed_at` (`last_executed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自動化腳本元數據表';

-- 排程任務表
CREATE TABLE `schedules` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '排程任務唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '任務名稱',
    `description` TEXT COMMENT '任務描述',
    `script_id` VARCHAR(36) NOT NULL COMMENT '執行的腳本ID',
    `cron_expression` VARCHAR(100) NOT NULL COMMENT 'CRON表達式',
    `schedule_mode` ENUM('simple', 'advanced') DEFAULT 'simple' COMMENT '排程設定模式',
    `frequency` ENUM('minute', 'hourly', 'daily', 'weekly', 'monthly', 'custom') DEFAULT 'daily' COMMENT '執行頻率',
    `timezone` VARCHAR(100) DEFAULT 'UTC' COMMENT '排程時區',
    `parameters` JSON COMMENT '腳本執行時所需的參數',
    `schedule_config` JSON COMMENT '排程附加設定 (例如選擇的星期、月週期等)',
    `is_enabled` BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    `last_status` ENUM('success', 'failed', 'pending', 'running') DEFAULT 'pending' COMMENT '最後執行狀態',
    `last_run_at` TIMESTAMP NULL COMMENT '最後執行時間',
    `next_run_at` TIMESTAMP NULL COMMENT '下次執行時間',
    `creator_id` VARCHAR(36) COMMENT '創建者ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`script_id`) REFERENCES `automation_scripts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_schedule_mode` (`schedule_mode`),
    INDEX `idx_frequency` (`frequency`),
    INDEX `idx_timezone` (`timezone`),
    INDEX `idx_next_run` (`next_run_at`),
    INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排程任務表';

-- 執行日誌表 (儲存於 Elasticsearch, 此處為摘要或關聯)
CREATE TABLE `execution_logs` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '執行日誌唯一標識 (對應 Elasticsearch Document ID)',
    `script_id` VARCHAR(36) NOT NULL,
    `schedule_id` VARCHAR(36) COMMENT '排程任務ID',
    `event_id` VARCHAR(36) COMMENT '觸發事件ID',
    `trigger_type` ENUM('manual', 'scheduled', 'event', 'api') NOT NULL,
    `triggered_by_id` VARCHAR(36) COMMENT '觸發者ID',
    `status` ENUM('pending', 'running', 'success', 'failed', 'cancelled', 'timeout') DEFAULT 'pending',
    `start_time` TIMESTAMP NULL,
    `end_time` TIMESTAMP NULL,
    `duration_seconds` INT COMMENT '執行時長(秒)',
    `exit_code` INT COMMENT '退出代碼',
    `input_parameters` JSON COMMENT '輸入參數',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`script_id`) REFERENCES `automation_scripts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`triggered_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_script_id` (`script_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='執行日誌摘要表';

-- ===========================================
-- 通知管理 (Notification Management)
-- ===========================================

-- 通知管道定義表
CREATE TABLE `notification_channels` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '通知管道唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '管道名稱',
    `type` ENUM('email', 'slack', 'webhook', 'pagerduty', 'sms', 'line_notify', 'teams') NOT NULL COMMENT '管道類型',
    `description` TEXT COMMENT '管道描述',
    `template_key` VARCHAR(100) COMMENT '套用的訊息模板鍵值',
    `config` JSON COMMENT '管道專屬設定 (如收件人、Webhook URL 等)',
    `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否啟用',
    `last_test_status` ENUM('success', 'failed', 'pending') DEFAULT NULL COMMENT '最近測試結果',
    `last_test_message` TEXT COMMENT '最近測試訊息',
    `last_test_at` TIMESTAMP NULL COMMENT '最近測試時間',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY `uniq_notification_channel_name` (`name`),
    INDEX `idx_notification_channel_type` (`type`),
    INDEX `idx_notification_channel_enabled` (`is_enabled`),
    INDEX `idx_notification_channel_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知管道定義表';

-- 通知策略主表
CREATE TABLE `notification_policies` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '通知策略唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '策略名稱',
    `description` TEXT COMMENT '策略描述',
    `resource_group_id` VARCHAR(36) NOT NULL COMMENT '適用的資源群組ID',
    `responsible_team_id` VARCHAR(36) NOT NULL COMMENT '負責團隊ID',
    `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT '策略優先順序',
    `match_type` ENUM('all', 'any') DEFAULT 'all' COMMENT '條件匹配邏輯',
    `notes` TEXT COMMENT '補充說明或升級策略',
    `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否啟用',
    `trigger_count` INT DEFAULT 0 COMMENT '觸發次數',
    `last_triggered_at` TIMESTAMP NULL COMMENT '最近觸發時間',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (`resource_group_id`) REFERENCES `resource_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`responsible_team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT,
    INDEX `idx_notification_policy_group` (`resource_group_id`),
    INDEX `idx_notification_policy_team` (`responsible_team_id`),
    INDEX `idx_notification_policy_enabled` (`is_enabled`),
    INDEX `idx_notification_policy_priority` (`priority`),
    INDEX `idx_notification_policy_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略主表';

-- 通知策略與管道綁定表
CREATE TABLE `notification_policy_channels` (
    `policy_id` VARCHAR(36) NOT NULL COMMENT '通知策略ID',
    `channel_id` VARCHAR(36) NOT NULL COMMENT '通知管道ID',
    `channel_order` INT DEFAULT 0 COMMENT '通知發送順序 (0 代表同時送出)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`policy_id`, `channel_id`),
    FOREIGN KEY (`policy_id`) REFERENCES `notification_policies`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`channel_id`) REFERENCES `notification_channels`(`id`) ON DELETE CASCADE,
    INDEX `idx_notification_policy_channel_order` (`channel_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略與管道綁定表';

-- 通知策略條件表
CREATE TABLE `notification_policy_conditions` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '策略條件唯一標識',
    `policy_id` VARCHAR(36) NOT NULL COMMENT '通知策略ID',
    `field` VARCHAR(100) NOT NULL COMMENT '匹配欄位 (例如 severity、resource_type)',
    `operator` ENUM('equals', 'not_equals', 'in', 'not_in', 'contains', 'not_contains', 'regex') NOT NULL COMMENT '匹配運算子',
    `value_text` VARCHAR(255) COMMENT '條件值 (單值)',
    `value_json` JSON COMMENT '條件值 (多值或結構化內容)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`policy_id`) REFERENCES `notification_policies`(`id`) ON DELETE CASCADE,
    INDEX `idx_notification_condition_policy` (`policy_id`),
    INDEX `idx_notification_condition_field` (`field`),
    INDEX `idx_notification_condition_operator` (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知策略條件定義表';

-- 通知歷史記錄表 (平台核心功能)
CREATE TABLE `notification_history` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '通知記錄唯一標識',
    `event_id` VARCHAR(36) COMMENT '關聯事件ID',
    `policy_id` VARCHAR(36) COMMENT '觸發的策略ID',
    `policy_name` VARCHAR(255) COMMENT '策略名稱快照',
    `channel_id` VARCHAR(36) COMMENT '通知管道ID',
    `channel_name` VARCHAR(255) NOT NULL COMMENT '目標管道名稱',
    `channel_type` ENUM('email', 'slack', 'webhook', 'pagerduty', 'sms', 'line_notify', 'teams') COMMENT '通知管道類型',
    `recipient` VARCHAR(500) NOT NULL COMMENT '接收者地址或描述',
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'DELIVERED') DEFAULT 'PENDING' COMMENT '發送狀態',
    `message` TEXT COMMENT '通知內容摘要',
    `error_message` TEXT COMMENT '失敗時的錯誤訊息',
    `raw_payload` JSON COMMENT '原始通知內容快照',
    `actor` VARCHAR(255) DEFAULT 'system' COMMENT '觸發通知的角色',
    `sent_at` TIMESTAMP NULL COMMENT '發送時間',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`policy_id`) REFERENCES `notification_policies`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`channel_id`) REFERENCES `notification_channels`(`id`) ON DELETE SET NULL,
    INDEX `idx_notification_history_event` (`event_id`),
    INDEX `idx_notification_history_policy` (`policy_id`),
    INDEX `idx_notification_history_channel` (`channel_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知歷史記錄表';

-- ===========================================
-- 審計日誌 (Audit Logs)
-- ===========================================

CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '日誌唯一標識',
    `user_id` VARCHAR(36) COMMENT '操作用戶ID',
    `action_type` ENUM('create', 'update', 'delete', 'login', 'logout', 'access', 'export') NOT NULL,
    `resource_type` VARCHAR(100) COMMENT '資源類型',
    `resource_id` VARCHAR(36) COMMENT '資源ID',
    `details` JSON COMMENT '操作詳情，包含變更前後的 diff',
    `ip_address` VARCHAR(45) COMMENT 'IP地址',
    `user_agent` TEXT COMMENT '用戶代理',
    `result` ENUM('success', 'failure', 'partial') DEFAULT 'success' COMMENT '操作結果',
    `risk_level` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low' COMMENT '風險等級',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action_type` (`action_type`),
    INDEX `idx_resource` (`resource_type`, `resource_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='審計日誌表';

-- ===========================================
-- 分析與 AI (Analysis & AI)
-- ===========================================

-- 事件分析結果表
CREATE TABLE `event_analysis_results` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT '分析結果唯一標識',
    `event_id` VARCHAR(36) NOT NULL COMMENT '事件ID',
    `analysis_type` ENUM('rca', 'impact', 'recommendation', 'prediction') NOT NULL,
    `confidence_score` DECIMAL(5,2) COMMENT '置信度評分 0-100',
    `analysis_result` JSON COMMENT '分析結果詳情',
    `analyst_type` ENUM('ai', 'human', 'hybrid') DEFAULT 'ai',
    `status` ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    INDEX `idx_event_analysis` (`event_id`, `analysis_type`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事件分析結果表';

-- ===========================================
-- 其他輔助表
-- ===========================================

-- Webhook 接收器表
CREATE TABLE `webhook_receivers` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT 'Webhook 接收器唯一標識',
    `name` VARCHAR(255) NOT NULL COMMENT '接收器名稱',
    `endpoint_path` VARCHAR(255) UNIQUE NOT NULL COMMENT '端點路徑',
    `source_type` ENUM('grafana', 'prometheus', 'external') NOT NULL,
    `is_enabled` BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Webhook 接收器表';

INSERT INTO `webhook_receivers` (`id`, `name`, `endpoint_path`, `source_type`, `is_enabled`) VALUES
(UUID(), 'Grafana Alerting Webhook', '/api/v1/webhooks/grafana', 'grafana', TRUE);

SET FOREIGN_KEY_CHECKS = 1;
