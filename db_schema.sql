-- SRE 平台資料庫結構定義
-- 需先啟用 pgcrypto extension 以便使用 gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- 核心使用者與權限管理
-- =============================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(128) NOT NULL,
    email VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    language VARCHAR(32) DEFAULT 'zh-TW',
    timezone VARCHAR(64) DEFAULT 'Asia/Taipei',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_status CHECK (status IN ('active','disabled'))
);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_role VARCHAR(64),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);
CREATE INDEX idx_team_members_user ON team_members (user_id);

CREATE TABLE team_subscribers (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    subscriber_id VARCHAR(128) NOT NULL,
    subscriber_type VARCHAR(32) NOT NULL,
    user_id UUID REFERENCES users(id),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, subscriber_id),
    CONSTRAINT chk_team_subscribers_type CHECK (subscriber_type IN ('USER','SLACK_CHANNEL','EMAIL_GROUP','ON_CALL_SCHEDULE'))
);
CREATE INDEX idx_team_subscribers_user ON team_subscribers (user_id);
CREATE INDEX idx_team_subscribers_type ON team_subscribers (subscriber_type);

CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(256) NOT NULL,
    name VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'invitation_sent',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    token VARCHAR(256),
    CONSTRAINT chk_user_invitations_status CHECK (status IN ('invitation_sent','accepted','expired','cancelled'))
);
CREATE UNIQUE INDEX idx_user_invitations_active_email ON user_invitations (email)
    WHERE status = 'invitation_sent';
CREATE INDEX idx_user_invitations_status ON user_invitations (status);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_roles_status CHECK (status IN ('active','inactive'))
);
CREATE INDEX idx_roles_status ON roles (status);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module VARCHAR(128) NOT NULL,
    actions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_role_permissions_role ON role_permissions (role_id);

CREATE TABLE security_login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ NOT NULL,
    ip_address VARCHAR(64),
    device_info VARCHAR(256),
    status VARCHAR(32) NOT NULL,
    location VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_security_login_status CHECK (status IN ('success','failed'))
);
CREATE INDEX idx_security_login_user ON security_login_history (user_id, login_time DESC);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(16) NOT NULL DEFAULT 'auto',
    default_page VARCHAR(32) NOT NULL DEFAULT 'war_room',
    language VARCHAR(32) DEFAULT 'zh-TW',
    timezone VARCHAR(64) DEFAULT 'Asia/Taipei',
    notification_preferences JSONB NOT NULL DEFAULT '{"email_notification":true,"slack_notification":false,"merge_notification":false}'::JSONB,
    display_options JSONB NOT NULL DEFAULT '{"animation":true,"tooltips":true,"compact_mode":false}'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_preferences_theme CHECK (theme IN ('light','dark','auto')),
    CONSTRAINT chk_user_preferences_default_page CHECK (default_page IN ('war_room','incidents','resources','dashboards'))
);

CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL,
    category VARCHAR(64),
    status VARCHAR(16) NOT NULL DEFAULT 'unread',
    link_url TEXT,
    actions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT chk_user_notifications_severity CHECK (severity IN ('critical','warning','info','success')),
    CONSTRAINT chk_user_notifications_status CHECK (status IN ('unread','read'))
);
CREATE INDEX idx_user_notifications_user ON user_notifications (user_id, status, created_at DESC);

-- =============================
-- 自動化腳本 (供事件規則及排程引用)
-- =============================
CREATE TABLE automation_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    version VARCHAR(32) DEFAULT 'v1',
    tags JSONB DEFAULT '[]'::JSONB,
    last_execution_status VARCHAR(32) DEFAULT 'never',
    last_execution_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_automation_scripts_type CHECK (type IN ('shell','python','ansible','terraform')),
    CONSTRAINT chk_automation_scripts_last_status CHECK (last_execution_status IN ('never','running','success','failed'))
);

CREATE TABLE automation_script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    changelog TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_script_versions_unique ON automation_script_versions (script_id, version);

-- =============================
-- 事件資料模型
-- =============================
CREATE TABLE event_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    severity VARCHAR(32) NOT NULL,
    default_priority VARCHAR(8) NOT NULL DEFAULT 'P2',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    labels JSONB NOT NULL DEFAULT '[]'::JSONB,
    environments JSONB NOT NULL DEFAULT '[]'::JSONB,
    condition_groups JSONB NOT NULL,
    title_template TEXT,
    content_template TEXT,
    automation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    automation_script_id UUID REFERENCES automation_scripts(id),
    automation_parameters JSONB DEFAULT '{}'::JSONB,
    creator_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_rules_severity CHECK (severity IN ('critical','warning','info')),
    CONSTRAINT chk_event_rules_priority CHECK (default_priority IN ('P0','P1','P2','P3'))
);
CREATE INDEX idx_event_rules_enabled ON event_rules (enabled);

CREATE TABLE silence_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    description TEXT,
    silence_type VARCHAR(32) NOT NULL,
    scope VARCHAR(32) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(64) DEFAULT 'UTC',
    repeat_frequency VARCHAR(32),
    repeat_days TEXT[],
    repeat_until TIMESTAMPTZ,
    repeat_occurrences INTEGER,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_start BOOLEAN NOT NULL DEFAULT FALSE,
    notify_on_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_silence_rules_type CHECK (silence_type IN ('single','repeat','condition')),
    CONSTRAINT chk_silence_rules_scope CHECK (scope IN ('global','resource','team','tag')),
    CONSTRAINT chk_silence_rules_repeat_freq CHECK (
        repeat_frequency IS NULL OR repeat_frequency IN ('daily','weekly','monthly')
    )
);
CREATE INDEX idx_silence_rules_active ON silence_rules (enabled, starts_at, ends_at);

CREATE TABLE silence_rule_matchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    silence_id UUID NOT NULL REFERENCES silence_rules(id) ON DELETE CASCADE,
    matcher_key VARCHAR(128) NOT NULL,
    operator VARCHAR(32) NOT NULL,
    matcher_value VARCHAR(256) NOT NULL,
    CONSTRAINT chk_silence_matchers_operator CHECK (operator IN ('equals','regex'))
);
CREATE INDEX idx_silence_matchers_silence ON silence_rule_matchers (silence_id);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key VARCHAR(128) UNIQUE,
    summary VARCHAR(256) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    priority VARCHAR(8) NOT NULL DEFAULT 'P2',
    source VARCHAR(100),
    service_impact TEXT,
    resource_id UUID,
    rule_id UUID REFERENCES event_rules(id),
    trigger_threshold VARCHAR(64),
    trigger_value VARCHAR(64),
    unit VARCHAR(32),
    trigger_time TIMESTAMPTZ NOT NULL,
    assignee_id UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_events_severity CHECK (severity IN ('critical','warning','info')),
    CONSTRAINT chk_events_status CHECK (status IN ('new','acknowledged','in_progress','resolved','silenced')),
    CONSTRAINT chk_events_priority CHECK (priority IN ('P0','P1','P2','P3'))
);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_severity ON events (severity);
CREATE INDEX idx_events_trigger_time ON events (trigger_time DESC);
CREATE INDEX idx_events_priority ON events (priority);

CREATE TABLE event_tags (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag VARCHAR(128) NOT NULL,
    PRIMARY KEY (event_id, tag)
);

CREATE TABLE event_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    entry_type VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_timeline_type CHECK (entry_type IN ('status_change','note','automation','notification'))
);
CREATE INDEX idx_event_timeline_event ON event_timeline (event_id, created_at);

CREATE TABLE event_relations (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    related_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    relationship VARCHAR(64) NOT NULL,
    PRIMARY KEY (event_id, related_event_id)
);

CREATE TABLE event_ai_analysis (
    event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    summary TEXT,
    root_cause TEXT,
    impact_analysis TEXT,
    recommendations JSONB DEFAULT '[]'::JSONB,
    confidence NUMERIC(5,2),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_batch_operations (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    total_count INTEGER NOT NULL,
    processed_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    requested_by UUID NOT NULL REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    comment TEXT,
    request_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_event_batch_action CHECK (action IN ('acknowledge','resolve','assign','add_comment')),
    CONSTRAINT chk_event_batch_status CHECK (status IN ('pending','running','completed','failed'))
);
CREATE INDEX idx_event_batch_status ON event_batch_operations (status);
CREATE INDEX idx_event_batch_created_at ON event_batch_operations (created_at DESC);
CREATE INDEX idx_event_batch_requested_by ON event_batch_operations (requested_by);

CREATE TABLE event_batch_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES event_batch_operations(batch_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    success BOOLEAN NOT NULL,
    message TEXT,
    error_code VARCHAR(64),
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_event_batch_results_batch ON event_batch_results (batch_id);

-- =============================
-- 資源與拓撲
-- =============================
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL,
    ip_address INET NOT NULL,
    location VARCHAR(128),
    environment VARCHAR(64),
    team_id UUID REFERENCES teams(id),
    os VARCHAR(128),
    cpu_usage NUMERIC(5,2) DEFAULT 0,
    memory_usage NUMERIC(5,2) DEFAULT 0,
    disk_usage NUMERIC(5,2) DEFAULT 0,
    network_in_mbps NUMERIC(10,2) DEFAULT 0,
    network_out_mbps NUMERIC(10,2) DEFAULT 0,
    service_impact TEXT,
    notes TEXT,
    last_event_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_resources_status CHECK (status IN ('healthy','warning','critical','offline')),
    CONSTRAINT chk_resources_type CHECK (type IN ('server','database','cache','gateway','service'))
);
CREATE INDEX idx_resources_status ON resources (status);
CREATE INDEX idx_resources_type ON resources (type);
CREATE INDEX idx_resources_team ON resources (team_id);

CREATE TABLE resource_labels (
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    label_key VARCHAR(128) NOT NULL,
    label_value VARCHAR(128) NOT NULL,
    PRIMARY KEY (resource_id, label_key)
);

CREATE TABLE resource_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    metric VARCHAR(64) NOT NULL,
    unit VARCHAR(16),
    collected_at TIMESTAMPTZ NOT NULL,
    value NUMERIC(12,4) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resource_metrics_resource ON resource_metrics (resource_id, metric, collected_at DESC);

-- =============================
-- 系統指標定義與快照
-- =============================
CREATE TABLE metric_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_key VARCHAR(128) NOT NULL UNIQUE,
    display_name VARCHAR(128) NOT NULL,
    description TEXT,
    unit VARCHAR(32) NOT NULL,
    category VARCHAR(32) NOT NULL,
    resource_scope VARCHAR(32) NOT NULL,
    supported_aggregations TEXT[] NOT NULL DEFAULT ARRAY['avg']::TEXT[],
    default_aggregation VARCHAR(32) NOT NULL DEFAULT 'avg',
    warning_threshold NUMERIC(14,4),
    critical_threshold NUMERIC(14,4),
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_metric_definitions_category CHECK (category IN ('performance','reliability','saturation','cost','custom')),
    CONSTRAINT chk_metric_definitions_scope CHECK (resource_scope IN ('global','resource','resource_type','team')),
    CONSTRAINT chk_metric_definitions_aggs CHECK (supported_aggregations <@ ARRAY['avg','max','min','sum','p95','p99']),
    CONSTRAINT chk_metric_definitions_default CHECK (default_aggregation = ANY(supported_aggregations))
);
CREATE INDEX idx_metric_definitions_category ON metric_definitions (category);
CREATE INDEX idx_metric_definitions_scope ON metric_definitions (resource_scope);

CREATE TABLE system_metric_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
    collected_at TIMESTAMPTZ NOT NULL,
    granularity VARCHAR(16) NOT NULL,
    aggregation VARCHAR(32) NOT NULL,
    value NUMERIC(14,4) NOT NULL,
    status VARCHAR(32) NOT NULL,
    change_rate NUMERIC(10,4),
    comparison JSONB NOT NULL DEFAULT '{}'::JSONB,
    trend JSONB NOT NULL DEFAULT '[]'::JSONB,
    top_resources JSONB NOT NULL DEFAULT '[]'::JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_metric_snapshots_granularity CHECK (granularity IN ('1m','5m','15m','1h','6h','1d')),
    CONSTRAINT chk_metric_snapshots_status CHECK (status IN ('healthy','warning','critical','unknown')),
    CONSTRAINT chk_metric_snapshots_agg CHECK (aggregation IN ('avg','max','min','sum','p95','p99'))
);
CREATE INDEX idx_metric_snapshots_definition_time ON system_metric_snapshots (definition_id, collected_at DESC);
CREATE INDEX idx_metric_snapshots_status ON system_metric_snapshots (status);

CREATE TABLE resource_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    owner_team_id UUID REFERENCES teams(id),
    status_summary JSONB DEFAULT '{"healthy":0,"warning":0,"critical":0}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resource_group_members (
    group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, resource_id)
);

CREATE TABLE resource_group_subscribers (
    group_id UUID NOT NULL REFERENCES resource_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE topology_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    target_resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    relation VARCHAR(64) NOT NULL,
    traffic_level NUMERIC(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::JSONB
);
CREATE INDEX idx_topology_edges_source ON topology_edges (source_resource_id);

-- =============================
-- 資源批次作業與掃描
-- =============================
CREATE TABLE resource_batch_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    total_count INTEGER NOT NULL,
    processed_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    requested_by UUID REFERENCES users(id),
    target_team_id UUID REFERENCES teams(id),
    target_status VARCHAR(32),
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    reason TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT chk_resource_batch_action CHECK (action IN ('delete','update_status','assign_team','add_tags','remove_tags')),
    CONSTRAINT chk_resource_batch_status CHECK (status IN ('pending','running','completed','failed')),
    CONSTRAINT chk_resource_batch_target_status CHECK (target_status IS NULL OR target_status IN ('healthy','warning','critical','offline'))
);

CREATE TABLE resource_batch_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES resource_batch_operations(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
    success BOOLEAN NOT NULL,
    message TEXT,
    error TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resource_batch_results_operation ON resource_batch_results (operation_id);

CREATE TABLE resource_scan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_type VARCHAR(32) NOT NULL,
    target VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    options JSONB NOT NULL DEFAULT '{}'::JSONB,
    progress NUMERIC(5,2) NOT NULL DEFAULT 0,
    results_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    CONSTRAINT chk_resource_scan_type CHECK (scan_type IN ('network','resources','infrastructure')),
    CONSTRAINT chk_resource_scan_status CHECK (status IN ('pending','running','completed','failed'))
);
CREATE INDEX idx_resource_scan_status ON resource_scan_tasks (status);
CREATE INDEX idx_resource_scan_created_at ON resource_scan_tasks (created_at DESC);

CREATE TABLE resource_scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES resource_scan_tasks(id) ON DELETE CASCADE,
    resource_id UUID,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    ip_address INET,
    location VARCHAR(128),
    discovered_at TIMESTAMPTZ NOT NULL,
    services JSONB NOT NULL DEFAULT '[]'::JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    CONSTRAINT chk_resource_scan_result_type CHECK (type IN ('server','database','cache','gateway','service')),
    CONSTRAINT chk_resource_scan_result_status CHECK (status IN ('healthy','warning','critical','offline'))
);
CREATE INDEX idx_resource_scan_results_task ON resource_scan_results (task_id);

-- =============================
-- 儀表板與分析
-- =============================
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    viewer_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    panel_count INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    data_sources TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    target_page_key VARCHAR(64),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dashboards_status CHECK (status IN ('draft','published'))
);
CREATE INDEX idx_dashboards_category ON dashboards (category);
CREATE INDEX idx_dashboards_owner ON dashboards (owner_id);

CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL,
    config JSONB NOT NULL,
    position JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dashboard_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    label VARCHAR(128) NOT NULL,
    value VARCHAR(128) NOT NULL,
    trend NUMERIC(6,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE capacity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_range VARCHAR(32) NOT NULL,
    model VARCHAR(32),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_datapoints INTEGER NOT NULL,
    processing_time NUMERIC(10,2),
    accuracy NUMERIC(5,2)
);

CREATE TABLE capacity_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES capacity_reports(id) ON DELETE CASCADE,
    metric VARCHAR(64) NOT NULL,
    current_usage NUMERIC(10,2),
    forecast_usage NUMERIC(10,2),
    series JSONB NOT NULL,
    best_case JSONB,
    worst_case JSONB
);
CREATE INDEX idx_capacity_forecasts_report ON capacity_forecasts (report_id);

CREATE TABLE capacity_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES capacity_reports(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    impact VARCHAR(64),
    effort VARCHAR(64),
    cost_saving NUMERIC(12,2),
    description TEXT
);

CREATE TABLE resource_load_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collected_at TIMESTAMPTZ NOT NULL,
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    avg_cpu NUMERIC(5,2),
    avg_memory NUMERIC(5,2),
    disk_read NUMERIC(10,2),
    disk_write NUMERIC(10,2),
    net_in NUMERIC(10,2),
    net_out NUMERIC(10,2),
    anomaly_count INTEGER DEFAULT 0
);
CREATE INDEX idx_resource_load_resource ON resource_load_snapshots (resource_id, collected_at DESC);

CREATE TABLE ai_insight_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type VARCHAR(64) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    predicted_events INTEGER,
    accuracy NUMERIC(5,2),
    impact_range TEXT,
    summary TEXT
);

CREATE TABLE ai_insight_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES ai_insight_reports(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    priority VARCHAR(16) NOT NULL,
    description TEXT,
    action_url TEXT,
    CONSTRAINT chk_ai_insight_suggestions_priority CHECK (priority IN ('high','medium','low'))
);

-- =============================
-- 自動化排程與執行
-- =============================
CREATE TABLE automation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_automation_schedules_type CHECK (type IN ('one_time','recurring')),
    CONSTRAINT chk_automation_schedules_status CHECK (status IN ('enabled','disabled','running')),
    CONSTRAINT chk_automation_schedules_concurrency CHECK (concurrency_policy IN ('allow','forbid'))
);
CREATE INDEX idx_automation_schedules_script ON automation_schedules (script_id);
CREATE INDEX idx_automation_schedules_status ON automation_schedules (status);

CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID NOT NULL REFERENCES automation_scripts(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES automation_schedules(id) ON DELETE SET NULL,
    trigger_source VARCHAR(32) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_ms INTEGER,
    status VARCHAR(32) NOT NULL,
    triggered_by UUID REFERENCES users(id),
    parameters JSONB DEFAULT '{}'::JSONB,
    stdout TEXT,
    stderr TEXT,
    error_message TEXT,
    related_event_ids UUID[] DEFAULT '{}'::UUID[],
    attempt_count INTEGER DEFAULT 0,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    template_key VARCHAR(128),
    last_test_result VARCHAR(16),
    last_test_message TEXT,
    last_tested_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_channels_type CHECK (type IN ('Email','Slack','PagerDuty','Webhook','Teams','LINE Notify','SMS')),
    CONSTRAINT chk_notification_channels_status CHECK (status IN ('active','degraded','disabled')),
    CONSTRAINT chk_notification_channels_test_result CHECK (last_test_result IS NULL OR last_test_result IN ('success','failed','pending'))
);
CREATE INDEX idx_notification_channels_type ON notification_channels (type);
CREATE INDEX idx_notification_channels_status ON notification_channels (status);

CREATE TABLE automation_schedule_channels (
    schedule_id UUID NOT NULL REFERENCES automation_schedules(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (schedule_id, channel_id)
);

CREATE TABLE notification_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority VARCHAR(32) DEFAULT 'medium',
    trigger_condition TEXT NOT NULL,
    severity_filters TEXT[] DEFAULT ARRAY['critical','warning','info'],
    resource_filters JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_strategies_priority CHECK (priority IN ('high','medium','low'))
);
CREATE INDEX idx_notification_strategies_enabled ON notification_strategies (enabled);

CREATE TABLE notification_strategy_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES notification_strategies(id) ON DELETE CASCADE,
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    CONSTRAINT chk_notification_recipients_type CHECK (target_type IN ('user','team','role'))
);
CREATE INDEX idx_notification_recipients_strategy ON notification_strategy_recipients (strategy_id);

CREATE TABLE notification_strategy_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES notification_strategies(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
    template VARCHAR(128)
);
CREATE INDEX idx_notification_strategy_channels_strategy ON notification_strategy_channels (strategy_id);

CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES notification_strategies(id) ON DELETE SET NULL,
    channel_id UUID REFERENCES notification_channels(id) ON DELETE SET NULL,
    channel_type VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    channel_label TEXT,
    alert_title TEXT,
    actor VARCHAR(128),
    message TEXT,
    recipients JSONB NOT NULL DEFAULT '[]'::JSONB,
    sent_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    raw_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    attempts JSONB NOT NULL DEFAULT '[]'::JSONB,
    related_event_id UUID REFERENCES events(id),
    resend_count INTEGER NOT NULL DEFAULT 0,
    resend_available BOOLEAN NOT NULL DEFAULT FALSE,
    last_resend_at TIMESTAMPTZ,
    last_status_change_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_history_status CHECK (status IN ('SUCCESS','FAILED','RETRYING','QUEUED')),
    CONSTRAINT chk_notification_history_channel CHECK (channel_type IN ('Email','Slack','PagerDuty','Webhook','Teams','LINE Notify','SMS'))
);
CREATE INDEX idx_notification_history_sent_at ON notification_history (sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history (status);
CREATE INDEX idx_notification_history_last_resend ON notification_history (last_resend_at DESC);

CREATE TABLE notification_resend_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_history_id UUID NOT NULL REFERENCES notification_history(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    status VARCHAR(32) NOT NULL,
    channel_id UUID REFERENCES notification_channels(id) ON DELETE SET NULL,
    recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
    dry_run BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    result_message TEXT,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    CONSTRAINT chk_notification_resend_status CHECK (status IN ('queued','running','completed','failed'))
);
CREATE INDEX idx_notification_resend_jobs_history ON notification_resend_jobs (notification_history_id);
CREATE INDEX idx_notification_resend_jobs_requested_at ON notification_resend_jobs (requested_at DESC);

-- =============================
-- 平台設定與整合
-- =============================
CREATE TABLE tag_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, category)
);

CREATE TABLE tag_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tag_definitions(id) ON DELETE CASCADE,
    value VARCHAR(128) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_tag_values_unique ON tag_values (tag_id, value);

CREATE TABLE tag_category_metrics (
    category VARCHAR(64) PRIMARY KEY,
    total_keys INTEGER NOT NULL DEFAULT 0,
    required_keys INTEGER NOT NULL DEFAULT 0,
    optional_keys INTEGER NOT NULL DEFAULT 0,
    total_values INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tag_key_statistics (
    tag_id UUID PRIMARY KEY REFERENCES tag_definitions(id) ON DELETE CASCADE,
    total_values INTEGER NOT NULL DEFAULT 0,
    required_value_count INTEGER NOT NULL DEFAULT 0,
    optional_value_count INTEGER NOT NULL DEFAULT 0,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    top_values JSONB NOT NULL DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tag_key_statistics_usage ON tag_key_statistics (usage_count DESC);

CREATE TABLE email_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    smtp_host VARCHAR(256) NOT NULL,
    smtp_port INTEGER NOT NULL,
    username VARCHAR(128),
    sender_name VARCHAR(128),
    sender_email VARCHAR(256) NOT NULL,
    encryption VARCHAR(16) NOT NULL DEFAULT 'none',
    test_recipient VARCHAR(256),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_email_settings_encryption CHECK (encryption IN ('none','tls','ssl'))
);

CREATE TABLE email_test_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    triggered_by UUID REFERENCES users(id),
    status VARCHAR(32) NOT NULL,
    recipient VARCHAR(256) NOT NULL,
    template_key VARCHAR(128),
    subject_override TEXT,
    body_override TEXT,
    duration_ms INTEGER,
    response_message TEXT,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_email_test_history_status CHECK (status IN ('queued','success','failed'))
);
CREATE INDEX idx_email_test_history_executed_at ON email_test_history (executed_at DESC);

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
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    max_concurrent_scans INTEGER NOT NULL DEFAULT 10,
    auto_discovery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    alert_integration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    retention_events_days INTEGER NOT NULL DEFAULT 90,
    retention_logs_days INTEGER NOT NULL DEFAULT 30,
    retention_metrics_days INTEGER NOT NULL DEFAULT 365,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================
-- 審計日誌
-- =============================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(128) NOT NULL,
    target_type VARCHAR(64),
    target_id UUID,
    result VARCHAR(32) NOT NULL,
    ip_address VARCHAR(64),
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_logs_result CHECK (result IN ('success','failure'))
);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
