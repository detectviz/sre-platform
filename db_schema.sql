-- SRE 平台資料庫結構定義
-- 需先啟用 pgcrypto extension 以便使用 gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(128),
    email VARCHAR(256) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'viewer',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    language VARCHAR(32) DEFAULT 'zh-TW',
    timezone VARCHAR(64) DEFAULT 'Asia/Taipei',
    teams JSONB DEFAULT '[]'::JSONB,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    description TEXT,
    version VARCHAR(32),
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::JSONB,
    last_execution_status VARCHAR(32) DEFAULT 'never',
    last_execution_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scripts_type ON scripts (type);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL,
    ip_address INET NOT NULL,
    location VARCHAR(128),
    environment VARCHAR(32),
    team VARCHAR(64),
    os VARCHAR(128),
    cpu_usage NUMERIC(5,2) DEFAULT 0,
    memory_usage NUMERIC(5,2) DEFAULT 0,
    disk_usage NUMERIC(5,2) DEFAULT 0,
    network_in_mbps NUMERIC(10,2) DEFAULT 0,
    network_out_mbps NUMERIC(10,2) DEFAULT 0,
    tags JSONB DEFAULT '[]'::JSONB,
    label_values JSONB DEFAULT '[]'::JSONB,
    group_ids JSONB DEFAULT '[]'::JSONB,
    last_event_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resources_name ON resources (name);
CREATE INDEX idx_resources_type ON resources (type);
CREATE INDEX idx_resources_status ON resources (status);

CREATE TABLE resource_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    owner_team VARCHAR(64),
    member_count INTEGER DEFAULT 0,
    subscriber_count INTEGER DEFAULT 0,
    status_summary JSONB DEFAULT '{"healthy":0,"warning":0,"critical":0}'::JSONB,
    resource_ids JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resource_groups_name ON resource_groups (name);

CREATE TABLE event_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    severity VARCHAR(32) NOT NULL,
    target_type VARCHAR(64),
    label_selectors JSONB DEFAULT '[]'::JSONB,
    condition_groups JSONB NOT NULL,
    automation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    script_id UUID REFERENCES scripts(id),
    automation_parameters JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key VARCHAR(128) UNIQUE,
    summary VARCHAR(256) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    service_impact TEXT,
    resource_id UUID REFERENCES resources(id),
    rule_id UUID REFERENCES event_rules(id),
    metric VARCHAR(128),
    trigger_threshold VARCHAR(64),
    trigger_value VARCHAR(64),
    unit VARCHAR(32),
    trigger_time TIMESTAMPTZ NOT NULL,
    assignee_id UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    tags JSONB DEFAULT '[]'::JSONB,
    detection_source VARCHAR(64),
    timeline JSONB DEFAULT '[]'::JSONB,
    related_events JSONB DEFAULT '[]'::JSONB,
    automation_actions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_trigger_time ON events (trigger_time DESC);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_severity ON events (severity);
CREATE INDEX idx_events_resource ON events (resource_id);
CREATE INDEX idx_events_rule ON events (rule_id);

CREATE TABLE silences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    silence_type VARCHAR(32) NOT NULL,
    scope VARCHAR(32) NOT NULL,
    matchers JSONB DEFAULT '[]'::JSONB,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(64),
    repeat_pattern JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_start BOOLEAN NOT NULL DEFAULT FALSE,
    notify_on_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_silences_active ON silences (is_enabled, start_time, end_time);

CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    tags JSONB DEFAULT '[]'::JSONB,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    kpi_summary JSONB DEFAULT '{}'::JSONB,
    widgets JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dashboards_category ON dashboards (category);
CREATE INDEX idx_dashboards_owner ON dashboards (owner_id);

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    script_id UUID NOT NULL REFERENCES scripts(id),
    type VARCHAR(32) NOT NULL,
    cron_expression VARCHAR(128),
    timezone VARCHAR(64) DEFAULT 'UTC',
    next_run_time TIMESTAMPTZ,
    last_run_time TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'enabled',
    concurrency_policy VARCHAR(32) DEFAULT 'allow',
    retry_policy JSONB DEFAULT '{"max_retries":0,"interval_seconds":0}'::JSONB,
    notify_on_success BOOLEAN NOT NULL DEFAULT FALSE,
    notify_on_failure BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_schedules_script ON schedules (script_id);
CREATE INDEX idx_schedules_next_run ON schedules (next_run_time);

CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES scripts(id),
    schedule_id UUID REFERENCES schedules(id),
    trigger_source VARCHAR(32) NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_ms INTEGER,
    status VARCHAR(32) NOT NULL,
    triggered_by UUID REFERENCES users(id),
    parameters JSONB DEFAULT '{}'::JSONB,
    stdout TEXT,
    stderr TEXT,
    error_message TEXT,
    related_event_ids UUID[] DEFAULT '{}',
    attempt_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_executions_start_time ON executions (start_time DESC);
CREATE INDEX idx_executions_status ON executions (status);

CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    last_tested_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_channels_type ON notification_channels (type);
CREATE INDEX idx_notification_channels_status ON notification_channels (status);

CREATE TABLE notification_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority VARCHAR(32) DEFAULT 'medium',
    severity_filters TEXT[] DEFAULT ARRAY['critical','warning','info'],
    channel_ids UUID[] DEFAULT '{}',
    recipients JSONB DEFAULT '[]'::JSONB,
    trigger_condition JSONB DEFAULT '{}'::JSONB,
    resource_filters JSONB DEFAULT '{}'::JSONB,
    escalation_delay_minutes INTEGER DEFAULT 0,
    repeat_frequency_minutes INTEGER DEFAULT 0,
    silence_ids UUID[] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_policies_enabled ON notification_policies (enabled);
CREATE INDEX idx_notification_policies_priority ON notification_policies (priority);

CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES notification_policies(id),
    channel_id UUID REFERENCES notification_channels(id),
    channel_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    recipients JSONB DEFAULT '[]'::JSONB,
    sent_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    payload JSONB DEFAULT '{}'::JSONB,
    attempts JSONB DEFAULT '[]'::JSONB,
    related_event_id UUID REFERENCES events(id)
);
CREATE INDEX idx_notification_history_sent_at ON notification_history (sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history (status);
CREATE INDEX idx_notification_history_policy ON notification_history (policy_id);

CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(128) NOT NULL,
    value VARCHAR(128) NOT NULL,
    category VARCHAR(64),
    color VARCHAR(32),
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (key, value)
);
CREATE INDEX idx_labels_category ON labels (category);

CREATE TABLE mail_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    smtp_host VARCHAR(256) NOT NULL,
    smtp_port INTEGER NOT NULL,
    username VARCHAR(128),
    password_encrypted TEXT,
    sender_name VARCHAR(128),
    sender_email VARCHAR(256) NOT NULL,
    reply_to VARCHAR(256),
    encryption VARCHAR(16) NOT NULL DEFAULT 'none',
    test_recipient VARCHAR(256),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_tested_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mail_settings_enabled ON mail_settings (is_enabled);

CREATE TABLE auth_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(32) NOT NULL,
    oidc_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    realm VARCHAR(128),
    client_id VARCHAR(256) NOT NULL,
    client_secret_encrypted TEXT,
    client_secret_hint VARCHAR(64),
    auth_url VARCHAR(512) NOT NULL,
    token_url VARCHAR(512) NOT NULL,
    userinfo_url VARCHAR(512),
    redirect_uri VARCHAR(512),
    logout_url VARCHAR(512),
    scopes TEXT[] DEFAULT ARRAY['openid','profile','email'],
    user_sync BOOLEAN NOT NULL DEFAULT FALSE,
    last_tested_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_auth_settings_provider ON auth_settings (provider);

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(16) NOT NULL DEFAULT 'auto',
    default_page VARCHAR(32) NOT NULL DEFAULT 'war_room',
    language VARCHAR(32) DEFAULT 'zh-TW',
    timezone VARCHAR(64) DEFAULT 'Asia/Taipei',
    notification_preferences JSONB DEFAULT '{"email_notification":true,"slack_notification":false,"merge_notification":false}'::JSONB,
    display_options JSONB DEFAULT '{"animation":true,"tooltips":true,"compact_mode":false}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);
