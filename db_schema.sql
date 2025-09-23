-- SRE 平台資料庫結構定義
-- 需先啟用 pgcrypto extension 以便使用 gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- 核心使用者與權限管理
-- =============================
CREATE TABLE users (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 使用者帳號
    username VARCHAR(128) NOT NULL UNIQUE,
    -- 顯示名稱
    display_name VARCHAR(128) NOT NULL,
    -- 電子郵件
    email VARCHAR(256) NOT NULL,
    -- 頭像網址
    avatar_url TEXT,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    -- 最後登入時間
    last_login_at TIMESTAMPTZ,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_status CHECK (status IN ('active','disabled'))
);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE teams (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 描述
    description TEXT,
    -- 擁有者識別碼
    owner_id UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    -- 團隊識別碼
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    -- 使用者識別碼
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 成員關係角色
    membership_role VARCHAR(64),
    -- 加入時間
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);
CREATE INDEX idx_team_members_user ON team_members (user_id);

CREATE TABLE team_subscribers (
    -- 團隊識別碼
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    -- 訂閱對象識別碼
    subscriber_id VARCHAR(128) NOT NULL,
    -- 訂閱對象類型
    subscriber_type VARCHAR(32) NOT NULL,
    -- 使用者識別碼
    user_id UUID REFERENCES users(id),
    -- 訂閱時間
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, subscriber_id),
    CONSTRAINT chk_team_subscribers_type CHECK (subscriber_type IN ('USER','SLACK_CHANNEL','EMAIL_GROUP','ON_CALL_SCHEDULE'))
);
CREATE INDEX idx_team_subscribers_user ON team_subscribers (user_id);
CREATE INDEX idx_team_subscribers_type ON team_subscribers (subscriber_type);

CREATE TABLE user_invitations (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 電子郵件
    email VARCHAR(256) NOT NULL,
    -- 名稱
    name VARCHAR(128),
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'invitation_sent',
    -- 邀請者識別碼
    invited_by UUID REFERENCES users(id),
    -- 邀請時間
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 到期時間
    expires_at TIMESTAMPTZ,
    -- 接受時間
    accepted_at TIMESTAMPTZ,
    -- 最後發送時間
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 令牌
    token VARCHAR(256),
    CONSTRAINT chk_user_invitations_status CHECK (status IN ('invitation_sent','accepted','expired','cancelled'))
);
CREATE UNIQUE INDEX idx_user_invitations_active_email ON user_invitations (email)
    WHERE status = 'invitation_sent';
CREATE INDEX idx_user_invitations_status ON user_invitations (status);

CREATE TABLE roles (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(64) NOT NULL UNIQUE,
    -- 描述
    description TEXT,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_roles_status CHECK (status IN ('active','inactive'))
);
CREATE INDEX idx_roles_status ON roles (status);

CREATE TABLE user_roles (
    -- 使用者識別碼
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 角色識別碼
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    -- 指派時間
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 角色識別碼
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    -- 模組
    module VARCHAR(128) NOT NULL,
    -- 操作列表
    actions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_permissions_role ON role_permissions (role_id);

CREATE TABLE security_login_history (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 使用者識別碼
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 登入時間
    login_time TIMESTAMPTZ NOT NULL,
    -- IP位址
    ip_address VARCHAR(64),
    -- 裝置資訊
    device_info VARCHAR(256),
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 位置
    location VARCHAR(128),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_security_login_status CHECK (status IN ('success','failed'))
);
CREATE INDEX idx_security_login_user ON security_login_history (user_id, login_time DESC);

CREATE TABLE user_preferences (
    -- 使用者識別碼
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    -- 主題
    theme VARCHAR(16) NOT NULL DEFAULT 'auto',
    -- 預設落地頁類型 (system_page 或 dashboard)
    default_home_type VARCHAR(32) NOT NULL DEFAULT 'system_page',
    -- 系統頁面鍵值 (僅當類型為 system_page 時使用)
    default_home_page_key VARCHAR(64) DEFAULT 'war_room',
    -- 預設儀表板識別碼 (僅當類型為 dashboard 時使用)
    default_dashboard_id UUID REFERENCES dashboards(id) ON DELETE SET NULL,
    -- 語言
    language VARCHAR(32) NOT NULL DEFAULT 'zh-TW',
    -- 時區
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Taipei',
    -- 通知偏好
    notification_preferences JSONB NOT NULL DEFAULT '{"email_notification":true,"slack_notification":false,"merge_notification":false}'::JSONB,
    -- 顯示選項
    display_options JSONB NOT NULL DEFAULT '{"animation":true,"tooltips":true,"compact_mode":false}'::JSONB,
    -- 儀表板偏好設定
    dashboard_preferences JSONB NOT NULL DEFAULT '{"auto_refresh_interval_seconds":300,"auto_save_layout":true}'::JSONB,
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_preferences_theme CHECK (theme IN ('light','dark','auto')),
    CONSTRAINT chk_user_preferences_home_type CHECK (default_home_type IN ('system_page','dashboard')),
    CONSTRAINT chk_user_preferences_home_target CHECK (
        (default_home_type = 'system_page' AND default_home_page_key IS NOT NULL AND default_dashboard_id IS NULL)
        OR (default_home_type = 'dashboard' AND default_dashboard_id IS NOT NULL)
    ),
    CONSTRAINT chk_user_preferences_home_key CHECK (
        default_home_type <> 'system_page'
        OR default_home_page_key IN ('war_room','incidents','resources','analysis','automation','notifications','dashboards')
    )
);
CREATE INDEX idx_user_preferences_dashboard ON user_preferences (default_dashboard_id);

CREATE TABLE user_notifications (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 使用者識別碼
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 標題
    title VARCHAR(256) NOT NULL,
    -- 描述
    description TEXT,
    -- 嚴重度
    severity VARCHAR(32) NOT NULL,
    -- 分類
    category VARCHAR(64),
    -- 狀態
    status VARCHAR(16) NOT NULL DEFAULT 'unread',
    -- 連結網址
    link_url TEXT,
    -- 操作列表
    actions JSONB DEFAULT '[]'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 閱讀時間
    read_at TIMESTAMPTZ,
    -- 清除時間
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_user_notifications_severity CHECK (severity IN ('critical','warning','info','success')),
    CONSTRAINT chk_user_notifications_status CHECK (status IN ('unread','read'))
);
CREATE INDEX idx_user_notifications_user ON user_notifications (user_id, status, created_at DESC);
CREATE INDEX idx_user_notifications_deleted ON user_notifications (user_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- =============================
-- 自動化腳本 (供事件規則及排程引用)
-- =============================
CREATE TABLE automation_scripts (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 類型
    type VARCHAR(32) NOT NULL,
    -- 描述
    description TEXT,
    -- 內容
    content TEXT NOT NULL,
    -- 版本
    version VARCHAR(32) DEFAULT 'v1',
    -- 標籤
    tags JSONB DEFAULT '[]'::JSONB,
    -- 最後執行狀態
    last_execution_status VARCHAR(32) DEFAULT 'never',
    -- 最後執行時間
    last_execution_at TIMESTAMPTZ,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 更新者識別碼
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_automation_scripts_type CHECK (type IN ('shell','python','ansible','terraform')),
    CONSTRAINT chk_automation_scripts_last_status CHECK (last_execution_status IN ('never','running','success','failed'))
);

CREATE TABLE automation_script_versions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 腳本識別碼
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE CASCADE,
    -- 版本
    version VARCHAR(32) NOT NULL,
    -- 內容
    content TEXT NOT NULL,
    -- 變更紀錄
    changelog TEXT,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_script_versions_unique ON automation_script_versions (script_id, version);

-- =============================
-- 事件資料模型
-- =============================
CREATE TABLE silence_rules (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL,
    -- 描述
    description TEXT,
    -- 靜默類型
    silence_type VARCHAR(32) NOT NULL,
    -- 適用範圍
    scope VARCHAR(32) NOT NULL,
    -- 關聯事件識別碼 (快速靜音)
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    -- 開始時間
    starts_at TIMESTAMPTZ NOT NULL,
    -- 結束時間
    ends_at TIMESTAMPTZ NOT NULL,
    -- 時區
    timezone VARCHAR(64) DEFAULT 'UTC',
    -- 重複頻率
    repeat_frequency VARCHAR(32),
    -- 重複天數
    repeat_days TEXT[],
    -- 重複直到
    repeat_until TIMESTAMPTZ,
    -- 重複發生次數
    repeat_occurrences INTEGER,
    -- 啟用
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- 開始時發送通知
    notify_on_start BOOLEAN NOT NULL DEFAULT FALSE,
    -- 結束時發送通知
    notify_on_end BOOLEAN NOT NULL DEFAULT FALSE,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_silence_rules_type CHECK (silence_type IN ('single','repeat','condition')),
    CONSTRAINT chk_silence_rules_scope CHECK (scope IN ('global','resource','team','tag','event')),
    CONSTRAINT chk_silence_rules_repeat_freq CHECK (
        -- 重複頻率
        repeat_frequency IS NULL OR repeat_frequency IN ('daily','weekly','monthly')
    )
);
CREATE INDEX idx_silence_rules_active ON silence_rules (enabled, starts_at, ends_at);

CREATE TABLE silence_rule_matchers (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 靜默識別碼
    silence_id UUID NOT NULL REFERENCES silence_rules(id) ON DELETE CASCADE,
    -- 比對鍵值
    matcher_key VARCHAR(128) NOT NULL,
    -- 運算子
    operator VARCHAR(32) NOT NULL,
    -- 比對數值
    matcher_value VARCHAR(256) NOT NULL,
    CONSTRAINT chk_silence_matchers_operator CHECK (operator IN ('equals','regex'))
);
CREATE INDEX idx_silence_matchers_silence ON silence_rule_matchers (silence_id);

CREATE TABLE events (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 事件鍵值
    event_key VARCHAR(128) UNIQUE,
    -- 摘要
    summary VARCHAR(256) NOT NULL,
    -- 描述
    description TEXT,
    -- 嚴重度
    severity VARCHAR(32) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 優先順序
    priority VARCHAR(8) NOT NULL DEFAULT 'P2',
    -- 事件來源分類
    event_source VARCHAR(32) NOT NULL DEFAULT 'platform_internal',
    -- 來源
    source VARCHAR(100),
    -- 服務影響
    service_impact TEXT,
    -- 資源識別碼
    resource_id UUID,
    -- Grafana 告警規則 UID
    grafana_rule_uid VARCHAR(64),
    -- 觸發門檻
    trigger_threshold VARCHAR(64),
    -- 觸發數值
    trigger_value VARCHAR(64),
    -- 單位
    unit VARCHAR(32),
    -- 觸發時間
    trigger_time TIMESTAMPTZ NOT NULL,
    -- 受指派者識別碼
    assignee_id UUID REFERENCES users(id),
    -- 已確認時間
    acknowledged_at TIMESTAMPTZ,
    -- 已解決時間
    resolved_at TIMESTAMPTZ,
    -- 中繼資料
    metadata JSONB DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_events_severity CHECK (severity IN ('critical','warning','info')),
    CONSTRAINT chk_events_status CHECK (status IN ('new','acknowledged','in_progress','resolved','silenced')),
    CONSTRAINT chk_events_priority CHECK (priority IN ('P0','P1','P2','P3')),
    CONSTRAINT chk_events_source CHECK (event_source IN ('grafana_webhook','platform_internal','manual_created'))
);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_severity ON events (severity);
CREATE INDEX idx_events_trigger_time ON events (trigger_time DESC);
CREATE INDEX idx_events_priority ON events (priority);
CREATE INDEX idx_events_rule_uid ON events (grafana_rule_uid);
CREATE INDEX idx_events_source_status_time ON events (event_source, status, trigger_time DESC);
COMMENT ON TABLE events IS '事件增值處理資料表，專注於 AI 分析、關聯分析與處理追蹤，不承載告警規則管理邏輯。';


CREATE TABLE event_tags (
    -- 事件識別碼
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    -- 標籤
    tag VARCHAR(128) NOT NULL,
    PRIMARY KEY (event_id, tag)
);

CREATE TABLE event_timeline (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 事件識別碼
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    -- 紀錄類型
    entry_type VARCHAR(32) NOT NULL,
    -- 訊息
    message TEXT NOT NULL,
    -- 中繼資料
    metadata JSONB DEFAULT '{}'::JSONB,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_timeline_type CHECK (entry_type IN ('status_change','note','automation','notification'))
);
CREATE INDEX idx_event_timeline_event ON event_timeline (event_id, created_at);

CREATE TABLE event_relations (
    -- 事件識別碼
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    -- 相關事件識別碼
    related_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    -- 關聯性
    relationship VARCHAR(64) NOT NULL,
    PRIMARY KEY (event_id, related_event_id)
);
COMMENT ON TABLE event_relations IS '管理事件之間的關聯資訊，支援根因定位與影響分析。';

CREATE TABLE event_ai_analysis (
    -- 事件識別碼
    event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    -- 摘要
    summary TEXT,
    -- 根源原因
    root_cause TEXT,
    -- 影響分析
    impact_analysis TEXT,
    -- 建議
    recommendations JSONB DEFAULT '[]'::JSONB,
    -- 可信度
    confidence NUMERIC(5,2),
    -- 產生時間
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE event_ai_analysis IS '儲存 AI 根因分析與建議結果，協助值班人員快速決策。';

CREATE TABLE event_rule_templates (
    -- 範本鍵值
    template_key VARCHAR(64) PRIMARY KEY,
    -- 範本名稱
    name VARCHAR(128) NOT NULL,
    -- 範本描述
    description TEXT,
    -- 預設嚴重度
    severity VARCHAR(32) NOT NULL,
    -- 預設優先順序
    default_priority VARCHAR(8) NOT NULL DEFAULT 'P2',
    -- 預設標籤
    labels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- 預設環境
    environments TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- 預設條件群組
    condition_groups JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 標題模板
    title_template TEXT,
    -- 內容模板
    content_template TEXT,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_rule_templates_severity CHECK (severity IN ('critical','warning','info')),
    CONSTRAINT chk_event_rule_templates_priority CHECK (default_priority IN ('P0','P1','P2','P3'))
);
CREATE INDEX idx_event_rule_templates_name ON event_rule_templates (name);
COMMENT ON TABLE event_rule_templates IS '事件規則快速套用範本表，提供前端精靈預設條件與內容模板。';

CREATE TABLE event_rule_snapshots (
    -- Grafana 規則 UID
    grafana_rule_uid VARCHAR(64) PRIMARY KEY,
    -- 快取的完整規則定義 (Grafana JSON 結構)
    raw_definition JSONB NOT NULL,
    -- 快取規則名稱供清單快速顯示
    cached_name VARCHAR(128) NOT NULL,
    -- 快取規則描述
    cached_description TEXT,
    -- 快取的嚴重度資訊
    cached_severity VARCHAR(32) NOT NULL,
    -- 快取的啟用狀態
    cached_enabled BOOLEAN NOT NULL,
    -- 快取的預設優先級
    cached_default_priority VARCHAR(8) NOT NULL DEFAULT 'P2',
    -- 快取的範本鍵值
    cached_template_key VARCHAR(64),
    -- 快取的標籤
    cached_labels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- 快取的環境設定
    cached_environments TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- 快取的標題模板
    cached_title_template TEXT,
    -- 快取的內容模板
    cached_content_template TEXT,
    -- 快取的規則建立者
    cached_creator VARCHAR(128) NOT NULL,
    -- 快取的最後更新時間
    cached_last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 與 Grafana 最新同步時間
    last_synced_at TIMESTAMPTZ,
    -- 同步狀態 (fresh: 已同步、stale: 使用快取、failed: 同步失敗)
    sync_status VARCHAR(16) NOT NULL DEFAULT 'fresh',
    -- 同步結果補充訊息
    sync_message TEXT,
    -- 最近更新操作者
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 最近更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_rule_snapshot_status CHECK (sync_status IN ('fresh','stale','failed')),
    CONSTRAINT chk_event_rule_snapshot_severity CHECK (cached_severity IN ('critical','warning','info')),
    CONSTRAINT chk_event_rule_snapshot_priority CHECK (cached_default_priority IN ('P0','P1','P2','P3'))
);
CREATE INDEX idx_event_rule_snapshots_status ON event_rule_snapshots (sync_status);
CREATE INDEX idx_event_rule_snapshots_synced_at ON event_rule_snapshots (last_synced_at DESC);
COMMENT ON TABLE event_rule_snapshots IS '快取 Grafana 告警規則的最新設定與建立者／最後更新時間，以支援離線檢視與編輯時的表單回填。';

CREATE TABLE event_rule_automation_bindings (
    -- Grafana 規則 UID
    grafana_rule_uid VARCHAR(64) PRIMARY KEY REFERENCES event_rule_snapshots(grafana_rule_uid) ON DELETE CASCADE,
    -- 是否啟用自動化
    automation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    -- 綁定腳本識別碼
    script_id UUID REFERENCES automation_scripts(id) ON DELETE SET NULL,
    -- 腳本參數
    parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 最後更新者
    updated_by UUID REFERENCES users(id),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_event_rule_automation_script ON event_rule_automation_bindings (script_id);
COMMENT ON TABLE event_rule_automation_bindings IS '儲存事件規則的自動化綁定設定，並串聯快取資訊補齊 Grafana 規則未提供的擴充屬性。';

CREATE TABLE batch_operations (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 目標類型 (事件或資源)
    target_type VARCHAR(32) NOT NULL,
    -- 操作
    action VARCHAR(32) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    -- 總數量
    total_count INTEGER NOT NULL,
    -- 已處理數量
    processed_count INTEGER NOT NULL DEFAULT 0,
    -- 成功次數
    success_count INTEGER NOT NULL DEFAULT 0,
    -- 失敗次數
    failed_count INTEGER NOT NULL DEFAULT 0,
    -- 請求者識別碼
    requested_by UUID REFERENCES users(id),
    -- 目標內容 (指派人、標籤等上下文)
    context JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 完成時間
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_batch_operations_target CHECK (target_type IN ('event','resource')),
    CONSTRAINT chk_batch_operations_status CHECK (status IN ('pending','running','completed','failed'))
);
CREATE INDEX idx_batch_operations_target ON batch_operations (target_type, action);
CREATE INDEX idx_batch_operations_status ON batch_operations (status);
CREATE INDEX idx_batch_operations_requested_by ON batch_operations (requested_by);

CREATE TABLE batch_operation_items (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 批次作業識別碼
    operation_id UUID NOT NULL REFERENCES batch_operations(id) ON DELETE CASCADE,
    -- 目標識別碼 (事件或資源)
    target_id UUID,
    -- 成功
    success BOOLEAN NOT NULL,
    -- 訊息
    message TEXT,
    -- 錯誤代碼
    error_code VARCHAR(64),
    -- 處理時間
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_batch_operation_items_operation ON batch_operation_items (operation_id);

-- =============================
-- 資源與拓撲
-- =============================
CREATE TABLE resources (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 類型
    type VARCHAR(32) NOT NULL,
    -- IP位址
    ip_address INET NOT NULL,
    -- 位置
    location VARCHAR(128),
    -- 環境
    environment VARCHAR(64),
    -- 團隊識別碼
    team_id UUID REFERENCES teams(id),
    -- 作業系統
    os VARCHAR(128),
    -- CPU使用量
    cpu_usage NUMERIC(5,2) DEFAULT 0,
    -- 記憶體使用量
    memory_usage NUMERIC(5,2) DEFAULT 0,
    -- 磁碟使用量
    disk_usage NUMERIC(5,2) DEFAULT 0,
    -- 網路輸入 Mbps
    network_in_mbps NUMERIC(10,2) DEFAULT 0,
    -- 網路輸出 Mbps
    network_out_mbps NUMERIC(10,2) DEFAULT 0,
    -- 服務影響
    service_impact TEXT,
    -- 備註
    notes TEXT,
    -- 最新事件數量
    last_event_count INTEGER DEFAULT 0,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_resources_status CHECK (status IN ('healthy','warning','critical','offline')),
    CONSTRAINT chk_resources_type CHECK (type IN ('server','database','cache','gateway','service'))
);
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_resources_type ON resources (type);
CREATE INDEX idx_resources_team ON resources (team_id);

-- 建立事件與資源的外鍵關聯，確保事件參照有效資源
ALTER TABLE events
    ADD CONSTRAINT fk_events_resources
    FOREIGN KEY (resource_id)
    REFERENCES resources(id)
    ON DELETE SET NULL;

CREATE INDEX idx_events_resource ON events (resource_id);

CREATE TABLE resource_tags (
    -- 資源識別碼
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    -- 標籤值識別碼
    tag_value_id UUID NOT NULL REFERENCES tag_values(id) ON DELETE CASCADE,
    -- 指派時間
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (resource_id, tag_value_id)
);
CREATE INDEX idx_resource_tags_value ON resource_tags (tag_value_id);

CREATE TABLE resource_metrics (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 資源識別碼
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    -- 指標鍵值 (例如 cpu.utilization、memory.utilization)
    metric_key VARCHAR(128) NOT NULL,
    -- 單位
    unit VARCHAR(16),
    -- 收集時間
    collected_at TIMESTAMPTZ NOT NULL,
    -- 數據粒度 (raw、1m、5m、1h、1d)
    granularity VARCHAR(16) NOT NULL DEFAULT 'raw',
    -- 彙總統計 (raw、avg、max、min、p95、p99、sum、count)
    statistic VARCHAR(16) NOT NULL DEFAULT 'raw',
    -- 數值
    value NUMERIC(12,4) NOT NULL,
    -- 額外維度 (如資料中心、節點)
    dimensions JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_resource_metrics_granularity CHECK (granularity IN ('raw','1m','5m','1h','1d')),
    CONSTRAINT chk_resource_metrics_statistic CHECK (statistic IN ('raw','avg','max','min','p95','p99','sum','count'))
);
CREATE INDEX idx_resource_metrics_resource ON resource_metrics (resource_id, metric_key, granularity, collected_at DESC);
CREATE INDEX idx_resource_metrics_metric ON resource_metrics (metric_key, statistic, granularity, collected_at DESC);

-- 建立資源負載分析所需的彙整檢視，提供單一來源的寬表結果
CREATE VIEW resource_load_rollups AS
SELECT
    resource_id,
    collected_at,
    granularity,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'cpu.utilization' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(5,2) AS avg_cpu,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'memory.utilization' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(5,2) AS avg_memory,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'disk.read_mbps' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(10,2) AS disk_read,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'disk.write_mbps' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(10,2) AS disk_write,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'network.in_mbps' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(10,2) AS net_in,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'network.out_mbps' AND statistic IN ('avg', 'raw')),
        0
    )::NUMERIC(10,2) AS net_out,
    COALESCE(
        MAX(value) FILTER (WHERE metric_key = 'anomaly.count' AND statistic IN ('count', 'sum')),
        0
    )::INTEGER AS anomaly_count
FROM resource_metrics
WHERE metric_key IN (
    'cpu.utilization',
    'memory.utilization',
    'disk.read_mbps',
    'disk.write_mbps',
    'network.in_mbps',
    'network.out_mbps',
    'anomaly.count'
)
GROUP BY resource_id, collected_at, granularity;

-- =============================
-- 系統指標定義與快照
-- =============================
CREATE TABLE metric_definitions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 指標鍵值
    metric_key VARCHAR(128) NOT NULL UNIQUE,
    -- 顯示名稱
    display_name VARCHAR(128) NOT NULL,
    -- 描述
    description TEXT,
    -- 單位
    unit VARCHAR(32) NOT NULL,
    -- 分類
    category VARCHAR(32) NOT NULL,
    -- 資源範圍
    resource_scope VARCHAR(32) NOT NULL,
    -- 支援的彙總方式
    supported_aggregations TEXT[] NOT NULL DEFAULT ARRAY['avg']::TEXT[],
    -- 預設彙總方式
    default_aggregation VARCHAR(32) NOT NULL DEFAULT 'avg',
    -- 警告門檻
    warning_threshold NUMERIC(14,4),
    -- 重大門檻
    critical_threshold NUMERIC(14,4),
    -- 標籤
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    -- 中繼資料
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_metric_definitions_category CHECK (category IN ('performance','reliability','saturation','cost','custom')),
    CONSTRAINT chk_metric_definitions_scope CHECK (resource_scope IN ('global','resource','resource_type','team')),
    CONSTRAINT chk_metric_definitions_aggs CHECK (supported_aggregations <@ ARRAY['avg','max','min','sum','p95','p99']),
    CONSTRAINT chk_metric_definitions_default CHECK (default_aggregation = ANY(supported_aggregations))
);
CREATE INDEX idx_metric_definitions_category ON metric_definitions (category);
CREATE INDEX idx_metric_definitions_scope ON metric_definitions (resource_scope);

CREATE TABLE system_metric_snapshots (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 指標定義識別碼
    definition_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
    -- 收集時間
    collected_at TIMESTAMPTZ NOT NULL,
    -- 粒度
    granularity VARCHAR(16) NOT NULL,
    -- 彙總
    aggregation VARCHAR(32) NOT NULL,
    -- 數值
    value NUMERIC(14,4) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 變更比率
    change_rate NUMERIC(10,4),
    -- 比較
    comparison JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 趨勢
    trend JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 熱門資源
    top_resources JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 中繼資料
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_metric_snapshots_granularity CHECK (granularity IN ('1m','5m','15m','1h','6h','1d')),
    CONSTRAINT chk_metric_snapshots_status CHECK (status IN ('healthy','warning','critical','unknown')),
    CONSTRAINT chk_metric_snapshots_agg CHECK (aggregation IN ('avg','max','min','sum','p95','p99'))
);
CREATE INDEX idx_metric_snapshots_definition_time ON system_metric_snapshots (definition_id, collected_at DESC);
CREATE INDEX idx_metric_snapshots_status ON system_metric_snapshots (status);

CREATE TABLE resource_groups (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 描述
    description TEXT,
    -- 擁有者團隊識別碼
    owner_team_id UUID REFERENCES teams(id),
    -- 狀態摘要
    status_summary JSONB DEFAULT '{"healthy":0,"warning":0,"critical":0}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resource_group_members (
    -- 群組識別碼
    group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    -- 資源識別碼
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    -- 新增時間
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, resource_id)
);

CREATE TABLE resource_group_subscribers (
    -- 群組識別碼
    group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    -- 使用者識別碼
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 訂閱時間
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE topology_edges (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 來源資源識別碼
    source_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    -- 目標資源識別碼
    target_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    -- 關聯
    relation VARCHAR(64) NOT NULL,
    -- 流量層級
    traffic_level NUMERIC(10,2) DEFAULT 0,
    -- 中繼資料
    metadata JSONB DEFAULT '{}'::JSONB
);
CREATE INDEX idx_topology_edges_source ON topology_edges (source_resource_id);

-- =============================
-- 資源批次作業與掃描
-- =============================
CREATE TABLE resource_scan_tasks (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 掃描類型
    scan_type VARCHAR(32) NOT NULL,
    -- 目標
    target VARCHAR(256) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    -- 選項
    options JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 進度
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    -- 結果數量
    results_count INTEGER NOT NULL DEFAULT 0,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 開始時間
    started_at TIMESTAMPTZ,
    -- 完成時間
    completed_at TIMESTAMPTZ,
    -- 錯誤訊息
    error_message TEXT,
    CONSTRAINT chk_resource_scan_type CHECK (scan_type IN ('network','resources','infrastructure')),
    CONSTRAINT chk_resource_scan_status CHECK (status IN ('pending','running','completed','failed'))
);
CREATE INDEX idx_resource_scan_status ON resource_scan_tasks (status);
CREATE INDEX idx_resource_scan_created_at ON resource_scan_tasks (created_at DESC);

CREATE TABLE resource_scan_results (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 任務識別碼
    task_id UUID NOT NULL REFERENCES resource_scan_tasks(id) ON DELETE CASCADE,
    -- 資源識別碼
    resource_id UUID,
    -- 名稱
    name VARCHAR(128) NOT NULL,
    -- 類型
    type VARCHAR(32) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- IP位址
    ip_address INET,
    -- 位置
    location VARCHAR(128),
    -- 發現時間
    discovered_at TIMESTAMPTZ NOT NULL,
    -- 服務
    services JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 中繼資料
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    CONSTRAINT chk_resource_scan_result_type CHECK (type IN ('server','database','cache','gateway','service')),
    CONSTRAINT chk_resource_scan_result_status CHECK (status IN ('healthy','warning','critical','offline'))
);
CREATE INDEX idx_resource_scan_results_task ON resource_scan_results (task_id);

-- =============================
-- 儀表板與分析
-- =============================
CREATE TABLE dashboards (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL,
    -- 分類
    category VARCHAR(64) NOT NULL,
    -- 儀表板類型
    dashboard_type VARCHAR(16) NOT NULL DEFAULT 'built_in',
    -- 描述
    description TEXT,
    -- 擁有者識別碼
    owner_id UUID REFERENCES users(id),
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    -- 是否預設
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    -- 是否精選
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    -- 觀看者數量
    viewer_count INTEGER NOT NULL DEFAULT 0,
    -- 收藏數量
    favorite_count INTEGER NOT NULL DEFAULT 0,
    -- 面板數量
    panel_count INTEGER NOT NULL DEFAULT 0,
    -- 標籤
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    -- 資料來源
    data_sources TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    -- Grafana 儀表板 UID
    grafana_dashboard_uid VARCHAR(128),
    -- Grafana 資料夾 UID
    grafana_folder_uid VARCHAR(128),
    -- Grafana 原始 URL
    grafana_url VARCHAR(512),
    -- Grafana 嵌入參數
    grafana_embed_options JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 目標頁面鍵值
    target_page_key VARCHAR(64),
    -- 發布時間
    published_at TIMESTAMPTZ,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dashboards_status CHECK (status IN ('draft','published')),
    CONSTRAINT chk_dashboards_type CHECK (dashboard_type IN ('built_in','grafana')),
    CONSTRAINT chk_dashboards_embed_options CHECK (jsonb_typeof(grafana_embed_options) = 'object'),
    CONSTRAINT chk_dashboards_grafana_fields CHECK (
        (dashboard_type = 'grafana' AND grafana_dashboard_uid IS NOT NULL)
        OR (dashboard_type = 'built_in' AND grafana_dashboard_uid IS NULL AND grafana_folder_uid IS NULL AND grafana_url IS NULL)
    )
);
CREATE INDEX idx_dashboards_category ON dashboards (category);
CREATE INDEX idx_dashboards_owner ON dashboards (owner_id);
CREATE INDEX idx_dashboards_type ON dashboards (dashboard_type);
CREATE UNIQUE INDEX idx_dashboards_grafana_uid ON dashboards (grafana_dashboard_uid) WHERE grafana_dashboard_uid IS NOT NULL;

CREATE TABLE dashboard_widgets (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 儀表板識別碼
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    -- 元件類型
    widget_type VARCHAR(64) NOT NULL,
    -- 標題
    title VARCHAR(128) NOT NULL,
    -- 設定
    config JSONB NOT NULL,
    -- 順位
    position JSONB NOT NULL,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_kpis (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 儀表板識別碼
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    -- 標籤
    label VARCHAR(128) NOT NULL,
    -- 數值
    value VARCHAR(128) NOT NULL,
    -- 趨勢
    trend NUMERIC(6,2),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE capacity_analysis_reports (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 時間範圍
    time_range VARCHAR(32) NOT NULL,
    -- 採用模型
    model VARCHAR(64),
    -- 產生時間
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 總計資料點
    total_datapoints INTEGER NOT NULL,
    -- 平均使用率 (% )
    avg_utilization NUMERIC(5,2),
    -- 峰值使用率 (% )
    peak_usage NUMERIC(5,2),
    -- 容量餘裕 (% )
    headroom NUMERIC(5,2),
    -- 預測天數
    forecast_horizon_days INTEGER,
    -- 處理時間 (毫秒)
    processing_time_ms INTEGER,
    -- 準確度
    accuracy NUMERIC(5,2),
    -- 預測序列集合
    forecasts JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 優化建議列表
    suggestions JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 其他補充資料
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);
CREATE INDEX idx_capacity_analysis_reports_generated ON capacity_analysis_reports (generated_at DESC);

CREATE TABLE ai_insight_reports (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 分析類型
    analysis_type VARCHAR(64) NOT NULL,
    -- 產生時間
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 預測事件
    predicted_events INTEGER,
    -- 準確度
    accuracy NUMERIC(5,2),
    -- 影響範圍
    impact_range TEXT,
    -- 摘要
    summary TEXT
);

CREATE TABLE ai_insight_suggestions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 報表識別碼
    report_id UUID NOT NULL REFERENCES ai_insight_reports(id) ON DELETE CASCADE,
    -- 標題
    title VARCHAR(256) NOT NULL,
    -- 優先順序
    priority VARCHAR(16) NOT NULL,
    -- 描述
    description TEXT,
    -- 操作網址
    action_url TEXT,
    CONSTRAINT chk_ai_insight_suggestions_priority CHECK (priority IN ('high','medium','low'))
);

-- =============================
-- 自動化排程與執行
-- =============================
CREATE TABLE automation_schedules (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 腳本識別碼
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE CASCADE,
    -- 類型
    type VARCHAR(32) NOT NULL,
    -- Cron運算式
    cron_expression VARCHAR(128),
    -- 時區
    timezone VARCHAR(64) DEFAULT 'UTC',
    -- 下一次執行時間
    next_run_time TIMESTAMPTZ,
    -- 最後執行時間
    last_run_time TIMESTAMPTZ,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'enabled',
    -- 併發政策
    concurrency_policy VARCHAR(32) DEFAULT 'allow',
    -- 重試政策
    retry_policy JSONB DEFAULT '{"max_retries":0,"interval_seconds":0}'::JSONB,
    -- 成功時發送通知
    notify_on_success BOOLEAN NOT NULL DEFAULT FALSE,
    -- 失敗時發送通知
    notify_on_failure BOOLEAN NOT NULL DEFAULT TRUE,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 更新者識別碼
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_automation_schedules_type CHECK (type IN ('one_time','recurring')),
    CONSTRAINT chk_automation_schedules_status CHECK (status IN ('enabled','disabled','running')),
    CONSTRAINT chk_automation_schedules_concurrency CHECK (concurrency_policy IN ('allow','forbid'))
);
CREATE INDEX idx_automation_schedules_script ON automation_schedules (script_id);
CREATE INDEX idx_automation_schedules_status ON automation_schedules (status);

CREATE TABLE automation_executions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 腳本識別碼
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE SET NULL,
    -- 排程識別碼
    schedule_id UUID REFERENCES automation_schedules(id) ON DELETE SET NULL,
    -- 觸發來源
    trigger_source VARCHAR(32) NOT NULL,
    -- 開始時間
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 結束時間
    end_time TIMESTAMPTZ,
    -- 持續時間毫秒
    duration_ms INTEGER,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 觸發者識別碼
    triggered_by UUID REFERENCES users(id),
    -- 參數
    parameters JSONB DEFAULT '{}'::JSONB,
    -- 標準輸出
    stdout TEXT,
    -- 標準錯誤
    stderr TEXT,
    -- 錯誤訊息
    error_message TEXT,
    -- 相關事件識別碼列表
    related_event_ids UUID[] DEFAULT '{}'::UUID[],
    -- 嘗試次數
    attempt_count INTEGER DEFAULT 0,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_automation_executions_status CHECK (status IN ('pending','running','success','failed','cancelled')),
    CONSTRAINT chk_automation_executions_source CHECK (trigger_source IN ('manual','event_rule','schedule'))
);
CREATE INDEX idx_automation_executions_status ON automation_executions (status);
CREATE INDEX idx_automation_executions_script ON automation_executions (script_id);

-- =============================
-- 通知策略與歷史
-- =============================
CREATE TABLE notification_channels (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 類型
    type VARCHAR(32) NOT NULL,
    -- 描述
    description TEXT,
    -- 啟用
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- 狀態
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    -- 設定
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 範本鍵值
    template_key VARCHAR(128),
    -- 最後測試結果
    last_test_result VARCHAR(16),
    -- 最後測試訊息
    last_test_message TEXT,
    -- 最後測試時間
    last_tested_at TIMESTAMPTZ,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 更新者識別碼
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_channels_type CHECK (type IN ('Email','Slack','PagerDuty','Webhook','Teams','LINE Notify','SMS')),
    CONSTRAINT chk_notification_channels_status CHECK (status IN ('active','degraded','disabled')),
    CONSTRAINT chk_notification_channels_test_result CHECK (last_test_result IS NULL OR last_test_result IN ('success','failed','pending'))
);
CREATE INDEX idx_notification_channels_type ON notification_channels (type);
CREATE INDEX idx_notification_channels_status ON notification_channels (status);
COMMENT ON TABLE notification_channels IS '平台專用通知通道設定，統一管理多種傳遞渠道並與 Grafana 告警互補。';

CREATE TABLE notification_channel_links (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 通知通道識別碼
    channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
    -- 關聯類型 (排程或通知策略)
    link_type VARCHAR(32) NOT NULL,
    -- 關聯實體識別碼 (排程或策略)
    link_id UUID NOT NULL,
    -- 自訂範本 (適用於通知策略)
    template VARCHAR(128),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_channel_links_type CHECK (link_type IN ('schedule','strategy'))
);
CREATE UNIQUE INDEX idx_notification_channel_links_unique ON notification_channel_links (link_type, link_id, channel_id);
CREATE INDEX idx_notification_channel_links_channel ON notification_channel_links (channel_id);
CREATE INDEX idx_notification_channel_links_link ON notification_channel_links (link_type, link_id);

CREATE TABLE notification_strategies (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL UNIQUE,
    -- 描述
    description TEXT,
    -- 啟用
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- 優先順序
    priority VARCHAR(32) DEFAULT 'medium',
    -- 觸發條件
    trigger_condition TEXT NOT NULL,
    -- 嚴重度篩選條件
    severity_filters TEXT[] DEFAULT ARRAY['critical','warning','info'],
    -- 資源篩選條件
    resource_filters JSONB DEFAULT '{}'::JSONB,
    -- 重試策略
    retry_policy JSONB NOT NULL DEFAULT '{"max_attempts":1,"interval_seconds":300,"escalation_channel_ids":[]}'::JSONB,
    -- 通知送達設定
    delivery_settings JSONB NOT NULL DEFAULT '{"enable_aggregation":false,"aggregation_window_seconds":0,"enable_delay":false,"delay_seconds":0,"enable_repeat_suppression":false,"repeat_suppression_minutes":0,"webhook_headers":{},"encrypt_payload":false,"api_token_secret_id":null}'::JSONB,
    -- 靜音設定
    snooze_settings JSONB NOT NULL DEFAULT '{"auto_snooze_minutes":0,"resume_on_resolve":true,"schedule":null}'::JSONB,
    -- 關聯靜音規則
    linked_silence_ids UUID[] NOT NULL DEFAULT '{}'::UUID[],
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 更新者識別碼
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_strategies_priority CHECK (priority IN ('high','medium','low'))
);
CREATE INDEX idx_notification_strategies_enabled ON notification_strategies (enabled);
CREATE INDEX idx_notification_strategies_priority ON notification_strategies (priority);
CREATE INDEX idx_notification_strategies_enabled_priority ON notification_strategies (enabled, priority, created_at DESC);
COMMENT ON TABLE notification_strategies IS '平台特有通知策略表，支援複雜業務條件、多渠道路由與重試/靜音等進階設定，補足 Grafana 通知限制。';

CREATE TABLE notification_strategy_recipients (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 通知策略識別碼
    strategy_id UUID NOT NULL REFERENCES notification_strategies(id) ON DELETE CASCADE,
    -- 目標類型
    target_type VARCHAR(32) NOT NULL,
    -- 目標識別碼
    target_id UUID NOT NULL,
    CONSTRAINT chk_notification_recipients_type CHECK (target_type IN ('user','team','role'))
);
CREATE INDEX idx_notification_recipients_strategy ON notification_strategy_recipients (strategy_id);
CREATE INDEX idx_notification_recipients_target ON notification_strategy_recipients (target_type, target_id);

CREATE TABLE notification_history (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 通知策略識別碼
    strategy_id UUID REFERENCES notification_strategies(id) ON DELETE SET NULL,
    -- 通知通道識別碼
    channel_id UUID REFERENCES notification_channels(id) ON DELETE SET NULL,
    -- 通道類型
    channel_type VARCHAR(32) NOT NULL,
    -- 狀態
    status VARCHAR(32) NOT NULL,
    -- 通道標籤
    channel_label TEXT,
    -- 警報標題
    alert_title TEXT,
    -- 操作人
    actor VARCHAR(128),
    -- 訊息
    message TEXT,
    -- 收件者列表
    recipients JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 發送時間
    sent_at TIMESTAMPTZ NOT NULL,
    -- 完成時間
    completed_at TIMESTAMPTZ,
    -- 重試次數
    retry_count INTEGER NOT NULL DEFAULT 0,
    -- 持續時間毫秒
    duration_ms INTEGER,
    -- 錯誤訊息
    error_message TEXT,
    -- 原始負載
    raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 中繼資料
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- 嘗試次數
    attempts JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 相關事件識別碼
    related_event_id UUID REFERENCES events(id),
    -- 最後狀態變更時間
    last_status_change_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_history_status CHECK (status IN ('SUCCESS','FAILED','RETRYING','QUEUED')),
    CONSTRAINT chk_notification_history_channel CHECK (channel_type IN ('Email','Slack','PagerDuty','Webhook','Teams','LINE Notify','SMS'))
);
CREATE INDEX idx_notification_history_sent_at ON notification_history (sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history (status);
CREATE INDEX idx_notification_history_channel_type ON notification_history (channel_type);
CREATE INDEX idx_notification_history_channel_id ON notification_history (channel_id);
CREATE INDEX idx_notification_history_strategy ON notification_history (strategy_id);
CREATE INDEX idx_notification_history_event ON notification_history (related_event_id);

-- =============================
-- 平台設定與整合
-- =============================
CREATE TABLE tag_definitions (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 名稱
    name VARCHAR(128) NOT NULL,
    -- 分類
    category VARCHAR(64) NOT NULL,
    -- 必填
    required BOOLEAN NOT NULL DEFAULT FALSE,
    -- 使用次數
    usage_count INTEGER NOT NULL DEFAULT 0,
    -- 建立者識別碼
    created_by UUID REFERENCES users(id),
    -- 更新者識別碼
    updated_by UUID REFERENCES users(id),
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, category)
);

CREATE TABLE tag_values (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 標籤識別碼
    tag_id UUID NOT NULL REFERENCES tag_definitions(id) ON DELETE CASCADE,
    -- 數值
    value VARCHAR(128) NOT NULL,
    -- 描述
    description TEXT,
    -- 是否預設
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    -- 使用次數
    usage_count INTEGER NOT NULL DEFAULT 0,
    -- 最後同步時間
    last_synced_at TIMESTAMPTZ,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_tag_values_unique ON tag_values (tag_id, value);

CREATE TABLE layout_widgets (
    -- 小工具識別碼
    widget_id VARCHAR(128) PRIMARY KEY,
    -- 顯示名稱
    name VARCHAR(128) NOT NULL,
    -- 說明
    description TEXT,
    -- 支援頁面 (JSON 陣列)
    supported_pages JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 資料來源 API
    data_api_endpoint VARCHAR(512) NOT NULL,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_layout_widgets_supported_pages CHECK (jsonb_typeof(supported_pages) = 'array')
);
CREATE INDEX idx_layout_widgets_supported_pages ON layout_widgets USING GIN (supported_pages);

CREATE TABLE page_layouts (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 對應頁面路徑
    page_path VARCHAR(256) NOT NULL,
    -- 適用範圍
    scope_type VARCHAR(16) NOT NULL,
    -- 角色或使用者識別碼 (global 範圍為 NULL)
    scope_id UUID,
    -- 指標卡片配置
    widgets_config JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新時間
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- 更新者
    updated_by UUID REFERENCES users(id),
    CONSTRAINT chk_page_layouts_scope CHECK (scope_type IN ('global','role','user')),
    CONSTRAINT chk_page_layouts_scope_id CHECK (
        (scope_type = 'global' AND scope_id IS NULL) OR
        (scope_type IN ('role','user') AND scope_id IS NOT NULL)
    ),
    CONSTRAINT chk_page_layouts_widgets_array CHECK (jsonb_typeof(widgets_config) = 'array')
);
CREATE INDEX idx_page_layouts_page ON page_layouts (page_path);
CREATE INDEX idx_page_layouts_lookup ON page_layouts (page_path, scope_type, scope_id);
CREATE UNIQUE INDEX idx_page_layouts_global ON page_layouts (page_path) WHERE scope_type = 'global';
CREATE UNIQUE INDEX idx_page_layouts_role ON page_layouts (page_path, scope_id) WHERE scope_type = 'role';
CREATE UNIQUE INDEX idx_page_layouts_user ON page_layouts (page_path, scope_id) WHERE scope_type = 'user';

-- =============================
-- 審計日誌
-- =============================
CREATE TABLE audit_logs (
    -- 主鍵識別碼
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 操作人識別碼
    actor_id UUID REFERENCES users(id),
    -- 操作
    action VARCHAR(128) NOT NULL,
    -- 目標類型
    target_type VARCHAR(64),
    -- 目標識別碼
    target_id UUID,
    -- 結果
    result VARCHAR(32) NOT NULL,
    -- IP位址
    ip_address VARCHAR(64),
    -- 詳細資訊
    details JSONB DEFAULT '{}'::JSONB,
    -- 建立時間
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_logs_result CHECK (result IN ('success','failure'))
);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
COMMENT ON TABLE audit_logs IS '審計日誌資料表，用於追蹤平台關鍵操作並符合合規需求。';

-- =============================
-- 審計日誌保留策略函式
-- =============================
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_interval INTERVAL DEFAULT INTERVAL '2 years')
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    removed_count INTEGER := 0;
BEGIN
    WITH removed AS (
        DELETE FROM audit_logs
        WHERE created_at < NOW() - retention_interval
        RETURNING 1
    )
    SELECT COUNT(*) INTO removed_count FROM removed;

    RETURN COALESCE(removed_count, 0);
END;
$$;
COMMENT ON FUNCTION cleanup_old_audit_logs(INTERVAL) IS '刪除早於保留期間的審計日誌並回傳刪除筆數，預設保留兩年資料。';
