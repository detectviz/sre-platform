-- SRE Platform - Database Schema
-- Version: 1.0.0
-- Author: Jules
--
-- 本檔案定義了 SRE Platform 所需的所有資料庫表結構。
-- 設計原則：
-- 1. 採用第三正規化 (3NF) 以減少資料冗餘。
-- 2. 使用 UUID 作為主鍵，便於分散式系統擴展。
-- 3. 為常用查詢欄位建立索引以優化效能。
-- 4. 使用 ENUM 型別確保資料一致性。
-- 5. 加上中文註解以利維護。

-- =================================================================
-- 核心模組：使用者與組織
-- =================================================================

CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '使用者 UUID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '使用者名稱 (來自 OIDC)',
  `email` VARCHAR(100) NOT NULL UNIQUE COMMENT '電子郵件 (來自 OIDC)',
  `display_name` VARCHAR(100) COMMENT '顯示名稱',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active' COMMENT '帳號狀態',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間'
) COMMENT='使用者資料表';

CREATE TABLE `user_preferences` (
  `user_id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '使用者 UUID',
  `theme` ENUM('淺色', '深色', '自動') DEFAULT '自動' COMMENT '介面主題',
  `default_page` VARCHAR(100) DEFAULT '/dashboards/war-room' COMMENT '預設登入頁面',
  `language` VARCHAR(10) DEFAULT 'zh-TW' COMMENT '語言',
  `timezone` VARCHAR(50) DEFAULT 'Asia/Taipei' COMMENT '時區',
  `notification_preferences` JSON COMMENT '通知偏好設定',
  `display_settings` JSON COMMENT '顯示設定',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) COMMENT='使用者偏好設定表';

CREATE TABLE `teams` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '團隊 UUID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '團隊名稱',
  `description` TEXT COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='團隊資料表';

CREATE TABLE `user_teams` (
  `user_id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `role` ENUM('member', 'admin') DEFAULT 'member' COMMENT '團隊角色',
  PRIMARY KEY (`user_id`, `team_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
) COMMENT='使用者與團隊關聯表';


-- =================================================================
-- 事件管理模組
-- =================================================================

CREATE TABLE `resources` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '資源 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '資源名稱',
  `type` VARCHAR(50) NOT NULL COMMENT '資源類型 (e.g., Server, Database)',
  `ip_address` VARCHAR(45) COMMENT 'IP 位址',
  `status` ENUM('healthy', 'warning', 'critical', 'offline') DEFAULT 'healthy' COMMENT '資源健康狀態',
  `location` VARCHAR(100) COMMENT '地理位置',
  `os` VARCHAR(50) COMMENT '作業系統',
  `tags` JSON COMMENT '標籤',
  `config` JSON COMMENT '其他設定資訊 (e.g., CPU, Memory)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間',
  INDEX `idx_name` (`name`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`)
) COMMENT='基礎設施資源表';

CREATE TABLE `events` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '事件 UUID',
  `summary` VARCHAR(255) NOT NULL COMMENT '事件摘要',
  `description` TEXT COMMENT '詳細描述',
  `status` ENUM('new', 'ack', 'resolved', 'silence') NOT NULL DEFAULT 'new' COMMENT '事件狀態',
  `severity` ENUM('critical', 'warning', 'info') NOT NULL DEFAULT 'info' COMMENT '嚴重程度',
  `resource_id` VARCHAR(36) COMMENT '關聯的資源 ID',
  `rule_id` VARCHAR(36) COMMENT '觸發的規則 ID',
  `assignee_id` VARCHAR(36) COMMENT '處理人 ID',
  `triggered_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '觸發時間',
  `resolved_at` TIMESTAMP NULL COMMENT '解決時間',
  `tags` JSON COMMENT '事件標籤',
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_status_severity` (`status`, `severity`),
  INDEX `idx_triggered_at` (`triggered_at`),
  INDEX `idx_resource_id` (`resource_id`)
) COMMENT='事件記錄表';

CREATE TABLE `event_rules` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '規則 UUID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '規則名稱',
  `description` TEXT COMMENT '規則描述',
  `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否啟用',
  `target_tags` JSON NOT NULL COMMENT '監控的資源標籤',
  `conditions` JSON NOT NULL COMMENT '觸發條件 (e.g., metric > threshold for duration)',
  `severity` ENUM('critical', 'warning', 'info') NOT NULL COMMENT '觸發事件的嚴重程度',
  `automation_enabled` BOOLEAN NOT NULL DEFAULT false COMMENT '是否啟用自動化',
  `automation_script_id` VARCHAR(36) COMMENT '自動化腳本 ID',
  `creator_id` VARCHAR(36) NOT NULL COMMENT '建立者 ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
) COMMENT='事件觸發規則表';

CREATE TABLE `silences` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '靜音規則 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '靜音規則名稱',
  `description` TEXT COMMENT '描述',
  `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否啟用',
  `matchers` JSON NOT NULL COMMENT '靜音條件 (匹配事件的標籤)',
  `starts_at` TIMESTAMP NOT NULL COMMENT '靜音開始時間',
  `ends_at` TIMESTAMP NOT NULL COMMENT '靜音結束時間',
  `creator_id` VARCHAR(36) NOT NULL COMMENT '建立者 ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`),
  INDEX `idx_starts_at_ends_at` (`starts_at`, `ends_at`)
) COMMENT='靜音規則表';

CREATE TABLE `event_history` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '歷史紀錄 UUID',
  `event_id` VARCHAR(36) NOT NULL COMMENT '關聯的事件 ID',
  `user_id` VARCHAR(36) COMMENT '操作者 ID (系統操作則為空)',
  `action` VARCHAR(255) NOT NULL COMMENT '操作描述',
  `details` JSON COMMENT '變更詳情 (e.g., old/new values)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) COMMENT='事件處理歷史表';


-- =================================================================
-- 資源管理模組
-- =================================================================

CREATE TABLE `resource_groups` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '群組 UUID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '群組名稱',
  `description` TEXT COMMENT '描述',
  `owner_id` VARCHAR(36) COMMENT '負責人 ID',
  `subscribers` INT DEFAULT 0 COMMENT '訂閱者數量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
) COMMENT='資源群組表';

CREATE TABLE `resource_group_members` (
  `group_id` VARCHAR(36) NOT NULL,
  `resource_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`group_id`, `resource_id`),
  FOREIGN KEY (`group_id`) REFERENCES `resource_groups`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE
) COMMENT='資源與群組關聯表';


-- =================================================================
-- 自動化模組
-- =================================================================

CREATE TABLE `scripts` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '腳本 UUID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '腳本名稱',
  `description` TEXT COMMENT '描述',
  `type` ENUM('Shell', 'Python', 'Ansible', 'Terraform') NOT NULL COMMENT '腳本類型',
  `content` TEXT NOT NULL COMMENT '腳本內容',
  `version` VARCHAR(20) NOT NULL DEFAULT '1.0.0' COMMENT '版本號',
  `creator_id` VARCHAR(36) NOT NULL COMMENT '建立者 ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
) COMMENT='自動化腳本庫';

CREATE TABLE `schedules` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '排程 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '排程名稱',
  `script_id` VARCHAR(36) NOT NULL COMMENT '關聯的腳本 ID',
  `cron_expression` VARCHAR(100) NOT NULL COMMENT 'CRON 表達式',
  `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否啟用',
  `creator_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`script_id`) REFERENCES `scripts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`)
) COMMENT='排程管理表';

CREATE TABLE `executions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '執行紀錄 UUID',
  `script_id` VARCHAR(36) NOT NULL COMMENT '執行的腳本 ID',
  `schedule_id` VARCHAR(36) COMMENT '觸發的排程 ID (可為空)',
  `event_id` VARCHAR(36) COMMENT '觸發的事件 ID (可為空)',
  `trigger_source` VARCHAR(50) NOT NULL COMMENT '觸發來源 (e.g., manual, schedule, event)',
  `status` ENUM('running', 'success', 'failed') NOT NULL COMMENT '執行狀態',
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '開始時間',
  `ended_at` TIMESTAMP NULL COMMENT '結束時間',
  `output` TEXT COMMENT '執行輸出',
  `error` TEXT COMMENT '錯誤訊息',
  FOREIGN KEY (`script_id`) REFERENCES `scripts`(`id`) ON DELETE CASCADE,
  INDEX `idx_script_id` (`script_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_started_at` (`started_at`)
) COMMENT='自動化執行日誌表';


-- =================================================================
-- 通知模組
-- =================================================================

CREATE TABLE `notification_channels` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '管道 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '管道名稱',
  `type` ENUM('Email', 'Slack', 'Webhook', 'LINE', 'SMS') NOT NULL COMMENT '管道類型',
  `config` JSON NOT NULL COMMENT '管道設定 (e.g., webhook url, smtp server)',
  `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否啟用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='通知管道配置表';

CREATE TABLE `notification_policies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '策略 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '策略名稱',
  `trigger_condition` JSON NOT NULL COMMENT '觸發條件',
  `channel_ids` JSON NOT NULL COMMENT '通知管道 ID 列表',
  `recipients` JSON NOT NULL COMMENT '接收者列表 (user_ids, team_ids, etc.)',
  `enabled` BOOLEAN NOT NULL DEFAULT true COMMENT '是否啟用',
  `priority` ENUM('high', 'medium', 'low') DEFAULT 'medium' COMMENT '優先級',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='通知策略配置表';

CREATE TABLE `notification_history` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '通知歷史 UUID',
  `policy_id` VARCHAR(36) COMMENT '觸發的策略 ID',
  `channel_id` VARCHAR(36) NOT NULL COMMENT '使用的管道 ID',
  `status` ENUM('sent', 'failed', 'retrying') NOT NULL COMMENT '發送狀態',
  `recipient` VARCHAR(255) NOT NULL COMMENT '接收者地址/ID',
  `content` TEXT COMMENT '通知內容',
  `error_message` TEXT COMMENT '錯誤訊息',
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`policy_id`) REFERENCES `notification_policies`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`channel_id`) REFERENCES `notification_channels`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_sent_at` (`sent_at`)
) COMMENT='通知發送歷史表';


-- =================================================================
-- 設定模組
-- =================================================================

CREATE TABLE `labels` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '標籤 UUID',
  `name` VARCHAR(100) NOT NULL UNIQUE COMMENT '標籤名稱 (key)',
  `category` VARCHAR(50) COMMENT '標籤分類',
  `required` BOOLEAN DEFAULT false COMMENT '是否為必填標籤',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='全域標籤管理表';

CREATE TABLE `settings` (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY COMMENT '設定鍵',
  `value` JSON NOT NULL COMMENT '設定值',
  `description` TEXT COMMENT '描述',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='系統全域設定表 (e.g., mail, auth)';

-- 預設設定值
INSERT INTO `settings` (`key`, `value`, `description`) VALUES
('mail_settings', '{}', 'SMTP 郵件伺服器設定'),
('auth_settings', '{}', 'OIDC 身份驗證設定');

-- =================================================================
-- 儀表板模組 (簡化版)
-- =================================================================

CREATE TABLE `dashboards` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '儀表板 UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '儀表板名稱',
  `description` TEXT COMMENT '描述',
  `config` JSON NOT NULL COMMENT '儀表板佈局與元件設定',
  `owner_id` VARCHAR(36) NOT NULL COMMENT '擁有者 ID',
  `is_public` BOOLEAN DEFAULT false COMMENT '是否公開',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
) COMMENT='儀表板配置表';
