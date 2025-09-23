/**
 * 業務實體類型定義
 * 定義系統中的核心業務對象和數據結構
 */

import { BaseEntity, Status, Priority, ResourceType, NotificationType, EventSeverity, AuditAction } from './api'

// 用戶實體
export interface User extends BaseEntity {
  username: string
  email: string
  display_name: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  status: Status
  roles: string[]
  teams: string[]
  last_login?: string
  department?: string
  title?: string
}

// 團隊實體
export interface Team extends BaseEntity {
  name: string
  description?: string
  owner_id: string
  members: string[]
  member_count: number
  status: Status
  tags?: string[]
  parent_team_id?: string
}

// 角色實體
export interface Role extends BaseEntity {
  name: string
  description?: string
  permissions: string[]
  user_count: number
  status: Status
  is_builtin: boolean
  color?: string
}

// 資源實體
export interface Resource extends BaseEntity {
  name: string
  type: ResourceType
  host?: string
  ip_address?: string
  port?: number
  location?: string
  status: Status
  health_status: 'healthy' | 'warning' | 'critical' | 'offline'
  tags: string[]
  groups: string[]
  metrics: {
    cpu_usage?: number
    memory_usage?: number
    disk_usage?: number
    network_in?: number
    network_out?: number
  }
  last_check_time: string
  next_check_time?: string
}

// 資源群組實體
export interface ResourceGroup extends BaseEntity {
  name: string
  description?: string
  owner_id: string
  resources: string[]
  resource_count: number
  status: Status
  tags?: string[]
}

// 事件實體
export interface Incident extends BaseEntity {
  title: string
  description?: string
  status: 'new' | 'acknowledged' | 'resolved' | 'silenced'
  severity: EventSeverity
  priority: Priority
  resource_id?: string
  resource_name: string
  rule_uid?: string
  rule_name: string
  trigger_time: string
  resolve_time?: string
  acknowledged_by?: string
  acknowledged_time?: string
  resolved_by?: string
  assignee_id?: string
  assignee_name?: string
  tags: string[]
  metadata: Record<string, any>
}

// 事件規則實體
export interface IncidentRule extends BaseEntity {
  name: string
  description?: string
  enabled: boolean
  severity: EventSeverity
  priority: Priority
  conditions: RuleCondition[]
  actions: RuleAction[]
  cooldown_period: number
  tags: string[]
  resource_selector: ResourceSelector
}

// 規則條件
export interface RuleCondition {
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  threshold: number
  duration: number // 持續時間（分鐘）
}

// 規則動作
export interface RuleAction {
  type: 'notification' | 'automation' | 'webhook'
  target: string
  config: Record<string, any>
}

// 資源選擇器
export interface ResourceSelector {
  resource_types?: ResourceType[]
  tags?: string[]
  groups?: string[]
  names?: string[]
}

// 靜音規則實體
export interface SilenceRule extends BaseEntity {
  name: string
  description?: string
  enabled: boolean
  matchers: SilenceMatcher[]
  time_range: TimeRange
  scope: SilenceScope
  creator: string
}

// 靜音匹配器
export interface SilenceMatcher {
  name: string
  value: string
  operator: '==' | '!=' | '=~' | '!~'
}

// 靜音時間範圍
export interface TimeRange {
  start_time?: string
  end_time?: string
  duration?: number // 持續時間（分鐘）
  timezone?: string
}

// 靜音範圍
export interface SilenceScope {
  type: 'global' | 'resource' | 'team'
  ids?: string[]
}

// 自動化腳本實體
export interface AutomationScript extends BaseEntity {
  name: string
  description?: string
  type: 'shell' | 'python' | 'ansible' | 'terraform'
  content: string
  version: string
  enabled: boolean
  tags: string[]
  parameters: ScriptParameter[]
  last_execution_status?: 'success' | 'failed' | 'running'
  last_execution_time?: string
  execution_count: number
}

// 腳本參數
export interface ScriptParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array'
  required: boolean
  default_value?: any
  description?: string
}

// 排程任務實體
export interface Schedule extends BaseEntity {
  name: string
  description?: string
  script_id: string
  script_name: string
  cron_expression: string
  enabled: boolean
  next_run_time: string
  last_run_time?: string
  last_run_status?: 'success' | 'failed' | 'running'
  parameters: Record<string, any>
  concurrency_policy: 'allow' | 'forbid' | 'replace'
  retry_policy: {
    enabled: boolean
    max_attempts: number
    retry_interval: number
  }
  notification_settings: {
    on_success: boolean
    on_failure: boolean
    channels: string[]
  }
}

// 執行日誌實體
export interface ExecutionLog extends BaseEntity {
  script_id: string
  script_name: string
  schedule_id?: string
  trigger_source: 'schedule' | 'manual' | 'event'
  start_time: string
  end_time?: string
  duration?: number
  status: 'success' | 'failed' | 'running'
  output: string
  error_message?: string
  parameters: Record<string, any>
  exit_code?: number
  retry_count: number
}

// 審計日誌實體
export interface AuditLog extends BaseEntity {
  user_id: string
  username: string
  action: AuditAction
  resource_type: string
  resource_id: string
  resource_name: string
  details: Record<string, any>
  ip_address: string
  user_agent?: string
  result: 'success' | 'failure'
  error_message?: string
}

// 儀表板實體
export interface Dashboard extends BaseEntity {
  name: string
  description?: string
  type: 'builtin' | 'grafana'
  category: string
  owner_id: string
  owner_name: string
  enabled: boolean
  tags: string[]
  config: DashboardConfig
  grafana_config?: GrafanaConfig
  statistics: {
    view_count: number
    last_viewed: string
    favorite_count: number
  }
}

// 儀表板配置
export interface DashboardConfig {
  widgets: WidgetConfig[]
  layout: 'grid' | 'flex'
  refresh_interval: number
  theme: 'light' | 'dark' | 'auto'
}

// Widget 配置
export interface WidgetConfig {
  id: string
  type: string
  title: string
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: Record<string, any>
  data_source: string
}

// Grafana 配置
export interface GrafanaConfig {
  dashboard_uid: string
  folder_uid?: string
  url: string
  panels?: string[]
  variables?: Record<string, string>
}

// 版面配置實體
export interface LayoutConfig extends BaseEntity {
  page_path: string
  page_name: string
  scope_type: 'user' | 'role' | 'global'
  scope_id?: string
  widgets_config: WidgetConfig[]
  is_default: boolean
}

// Widget 註冊表實體
export interface WidgetRegistry extends BaseEntity {
  widget_id: string
  display_name: string
  description: string
  supported_pages: string[]
  data_source_api: string
  category: string
  config_schema: Record<string, any>
  default_config: Record<string, any>
  icon?: string
  enabled: boolean
}

// 通知策略實體
export interface NotificationPolicy extends BaseEntity {
  name: string
  description?: string
  enabled: boolean
  priority: Priority
  trigger_conditions: TriggerCondition[]
  recipients: NotificationRecipient[]
  channels: NotificationChannel[]
  silence_rules: string[]
  cooldown_period: number
  escalation_policy?: EscalationPolicy
}

// 觸發條件
export interface TriggerCondition {
  event_type: string
  severity?: EventSeverity
  resource_types?: ResourceType[]
  tags?: string[]
  time_range?: TimeRange
}

// 通知接收者
export interface NotificationRecipient {
  type: 'user' | 'team' | 'role'
  id: string
  name: string
}

// 通知管道
export interface NotificationChannel {
  type: NotificationType
  id: string
  name: string
  config: Record<string, any>
  enabled: boolean
  status: 'online' | 'offline' | 'testing'
}

// 升級策略
export interface EscalationPolicy {
  enabled: boolean
  levels: EscalationLevel[]
}

// 升級等級
export interface EscalationLevel {
  delay: number // 延遲時間（分鐘）
  recipients: NotificationRecipient[]
  channels: NotificationChannel[]
}

// 通知歷史實體
export interface NotificationHistory extends BaseEntity {
  policy_id: string
  policy_name: string
  incident_id?: string
  channel_type: NotificationType
  recipient: string
  status: 'sent' | 'failed' | 'pending' | 'delivered'
  sent_time?: string
  delivery_time?: string
  error_message?: string
  content: string
  metadata: Record<string, any>
}
