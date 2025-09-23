// 類型定義統一導出

// 通用類型
export type {
  Status,
  TrendDirection,
  BreadcrumbItem,
  MenuItem,
  RouteConfig,
  KPIData,
  UserInfo,
  NotificationItem,
  ApiResponse,
  PaginationInfo,
  TableColumn,
  ThemeConfig,
  SystemSettings,
  SearchResultItem,
  IncidentStatus,
  IncidentSeverity,
  ResourceHealth,
  ResourceType
} from './common'

// 組件類型
export type {
  FilterOption,
  ToolbarAction,
  ColumnOption,
  PageHeaderProps,
  AppLayoutProps,
  GlobalSearchProps,
  NotificationCenterProps,
  UserMenuProps,
  ContextualKPICardProps,
  GrafanaDashboardProps,
  LazyRouteProps,
  ValidationRule,
  FormFieldConfig,
  ModalConfig
} from './components'

// 業務類型
export type {
  Incident,
  IncidentTimelineItem,
  EventRule,
  EventRuleCondition,
  EventRuleAction,
  Resource,
  ResourceMetric,
  ResourceGroup,
  Dashboard,
  DashboardConfig,
  DashboardPanel,
  AutomationScript,
  ScriptParameter,
  AutomationExecution,
  PlatformSettings,
  User,
  UserRole,
  UserPreferences,
  NotificationStrategy,
  NotificationCondition,
  NotificationChannel,
  EscalationRule
} from './business'