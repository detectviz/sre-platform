// 類型定義統一導出

// API 相關類型
export type {
  ApiResponse,
  PaginationResponse,
  PaginationParams,
  ListParams,
  FilterParams,
  SortParams,
  BaseEntity,
  Status,
  Priority,
  ResourceType,
  NotificationType,
  EventSeverity,
  AuditAction
} from './api'

// 業務實體類型
export type {
  User,
  Team,
  Role,
  Resource,
  ResourceGroup,
  Incident,
  IncidentRule,
  SilenceRule,
  AutomationScript,
  Schedule,
  ExecutionLog,
  AuditLog,
  Dashboard,
  LayoutConfig,
  WidgetRegistry,
  NotificationPolicy,
  NotificationHistory,
  RuleCondition,
  RuleAction,
  ResourceSelector,
  SilenceMatcher,
  TimeRange,
  SilenceScope,
  ScriptParameter,
  TriggerCondition,
  NotificationRecipient,
  NotificationChannel,
  EscalationPolicy,
  EscalationLevel,
  WidgetConfig,
  GrafanaConfig,
  DashboardConfig
} from './entities'

// 組件 Props 類型
export type {
  PageHeaderProps,
  KPICardData,
  ContextualKPICardProps,
  ToolbarActionsProps,
  ToolbarAction,
  CategoryFilterProps,
  CategoryConfig,
  DataTablePageProps,
  TabConfig,
  PageLayoutProps,
  PageLayoutConfig,
  GrafanaDashboardProps,
  GlobalSearchProps,
  NotificationCenterProps,
  UserMenuProps,
  FormFactoryProps,
  FormField,
  LazyRouteProps,
  GenericTableProps,
  GenericListProps,
  GenericModalProps,
  GenericDrawerProps,
  ConfirmDialogProps,
  StatusIndicatorProps,
  SearchResult,
  NotificationItem,
  NotificationAction,
  UserInfo,
  MenuItem,
  BreadcrumbItem
} from './components'

// 通用類型
export type {
  ResponseStatus,
  AppError,
  ApiState,
  UseQueryResult,
  UseMutationResult,
  DeepPartial,
  NonNullable,
  Optional,
  EventHandler,
  ChangeHandler,
  ClickHandler,
  VoidCallback,
  DataCallback,
  ErrorCallback,
  SuccessCallback,
  AsyncVoidFunction,
  AsyncDataFunction,
  AsyncCallback,
  FCWithChildren,
  ComponentWithClassName,
  ComponentWithStyle,
  KeyValuePair,
  ID,
  Name,
  Description,
  Tag,
  Version,
  URL,
  Path,
  ArrayOf,
  RecordOf,
  EnumType,
  Factory,
  FactoryWithParams,
  Comparator,
  Predicate,
  Mapper,
  Reducer
} from './common'

// 表格相關類型
export type {
  TableConfig,
  TableAction,
  TableColumn,
  DEFAULT_PAGINATION,
  DEFAULT_TABLE_STYLE,
  TABLE_SIZE_OPTIONS,
  TableSize
} from '../constants/table'

// 表格操作相關類型
export type {
  TableAction as TableActionType
} from '../components/table/tableActions'