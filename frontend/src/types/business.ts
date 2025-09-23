// 業務邏輯相關類型定義

// 事件管理
export interface Incident {
  id: string
  title: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  severity: 'critical' | 'high' | 'medium' | 'low'
  source: string
  assignee?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  tags: string[]
  affectedResources: string[]
  timeline: IncidentTimelineItem[]
}

export interface IncidentTimelineItem {
  id: string
  timestamp: string
  action: string
  description: string
  user: string
  type: 'status_change' | 'comment' | 'escalation' | 'resolution'
}

// 靜音規則
export interface SilenceRule {
  id: string
  name: string
  description: string
  matchers: string[]
  startTime: string
  endTime: string
  creator: string
  status: 'active' | 'expired' | 'pending'
  createdAt: string
  comment?: string
}

// 事件規則
export interface EventRule {
  id: string
  name: string
  description: string
  conditions: EventRuleCondition[]
  actions: EventRuleAction[]
  enabled: boolean
  priority: number
  createdAt: string
  updatedAt: string
  creator: string
}

export interface EventRuleCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte'
  value: string | number
  type: 'string' | 'number' | 'boolean'
}

export interface EventRuleAction {
  id: string
  type: 'notify' | 'escalate' | 'assign' | 'tag' | 'webhook'
  config: Record<string, any>
  delay?: number
}

// 資源管理
export interface Resource {
  id: string
  name: string
  type: 'server' | 'database' | 'service' | 'network' | 'storage'
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  health: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  metadata: {
    environment: string
    location: string
    owner: string
    tags: string[]
  }
  metrics: ResourceMetric[]
  lastUpdated: string
}

export interface ResourceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  threshold?: {
    warning: number
    critical: number
  }
}

// 資源群組
export interface ResourceGroup {
  id: string
  name: string
  description: string
  resources: string[]
  tags: string[]
  createdAt: string
  owner: string
}

// 儀表板
export interface Dashboard {
  id: string
  name: string
  description: string
  type: 'grafana' | 'custom'
  category: string
  tags: string[]
  isDefault: boolean
  isPublic: boolean
  config: DashboardConfig
  createdAt: string
  updatedAt: string
  creator: string
}

export interface DashboardConfig {
  grafanaId?: string
  panels?: DashboardPanel[]
  timeRange?: {
    from: string
    to: string
  }
  variables?: Record<string, string>
  refresh?: string
}

export interface DashboardPanel {
  id: string
  title: string
  type: 'graph' | 'table' | 'stat' | 'gauge' | 'heatmap'
  gridPos: {
    x: number
    y: number
    w: number
    h: number
  }
  targets: any[]
}

// 自動化腳本
export interface AutomationScript {
  id: string
  name: string
  description: string
  type: 'bash' | 'python' | 'ansible' | 'terraform'
  content: string
  parameters: ScriptParameter[]
  schedule?: {
    enabled: boolean
    cron: string
    timezone: string
  }
  tags: string[]
  createdAt: string
  updatedAt: string
  creator: string
}

export interface ScriptParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  description: string
  required: boolean
  defaultValue?: any
  options?: string[]
}

// 自動化執行記錄
export interface AutomationExecution {
  id: string
  scriptId: string
  status: 'running' | 'success' | 'failed' | 'cancelled'
  startTime: string
  endTime?: string
  output: string
  error?: string
  parameters: Record<string, any>
  triggeredBy: string
  triggerType: 'manual' | 'scheduled' | 'event'
}

// 系統設定
export interface PlatformSettings {
  general: {
    siteName: string
    siteUrl: string
    timezone: string
    dateFormat: string
  }
  authentication: {
    providers: string[]
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireSpecialChar: boolean
      requireNumber: boolean
    }
  }
  notifications: {
    emailEnabled: boolean
    slackEnabled: boolean
    webhookEnabled: boolean
    defaultChannels: string[]
  }
  monitoring: {
    dataRetention: number
    metricsInterval: number
    alertingEnabled: boolean
  }
}

// 用戶管理
export interface User {
  id: string
  username: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: string
  createdAt: string
  updatedAt: string
  preferences: UserPreferences
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
  description: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  defaultDashboard: string
  notifications: {
    email: boolean
    desktop: boolean
    slack: boolean
  }
}

// 通知策略
export interface NotificationStrategy {
  id: string
  name: string
  description: string
  conditions: NotificationCondition[]
  channels: NotificationChannel[]
  escalation: EscalationRule[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationCondition {
  field: string
  operator: string
  value: any
  type: string
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms'
  config: Record<string, any>
  enabled: boolean
}

export interface EscalationRule {
  level: number
  delay: number
  channels: string[]
  recipients: string[]
}