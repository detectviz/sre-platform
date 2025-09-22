export type ResourceStatus =
  | 'HEALTHY'
  | 'WARNING'
  | 'CRITICAL'
  | 'SILENCED'
  | 'MAINTENANCE'
  | 'UNKNOWN';

export type ResourceTag = {
  key: string;
  value: string;
};

export type TagFilterOperator = 'eq' | 'neq' | 'in' | 'not_in' | 'regex' | 'not_regex';

export type TagFilter = {
  key: string;
  operator: TagFilterOperator;
  values: string[];
};

export type ResourceMetricSnapshot = {
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkIn?: number;
  networkOut?: number;
  latencyMs?: number;
};

export type ResourceMetricHistory = {
  timestamps: string[];
  cpuSeries?: number[];
  memorySeries?: number[];
};

export type ResourceActionType = 'link' | 'automation' | 'navigate' | 'modal' | 'api';

export type ResourceAction = {
  key: string;
  label: string;
  type?: ResourceActionType;
  url?: string;
  target?: string;
  description?: string;
};

export type ResourceObservability = {
  grafanaUrl?: string;
  logsUrl?: string;
  runbookUrl?: string;
};

export type ResourceEventSummary = {
  id: string;
  summary?: string;
  severity?: string;
  status?: string;
  updatedAt?: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  ipAddress?: string;
  location?: string;
  provider?: string;
  teamId?: string;
  environment?: string;
  tags: ResourceTag[];
  groups: string[];
  relatedIncidents?: number;
  metrics: ResourceMetricSnapshot;
  metricsHistory?: ResourceMetricHistory;
  healthSummary?: string;
  healthReasons?: string[];
  actions?: ResourceAction[];
  observability?: ResourceObservability;
  relatedEvents?: ResourceEventSummary[];
  lastCheckedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginationMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type ResourceListResponse = {
  items: Resource[];
  pagination: PaginationMeta;
};

export type ResourceQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ResourceStatus | 'ALL';
  teamId?: string;
  groupId?: string;
  tags?: string[];
  tagFilters?: TagFilter[];
};

export type ResourceGroup = {
  id: string;
  name: string;
  description?: string;
  responsibleTeamId?: string;
  ownerName?: string;
  memberIds: string[];
  tags: ResourceTag[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: ResourceGroupMetadata;
};

export type ResourceGroupMetadata = {
  member_count?: number;
  health_breakdown?: {
    healthy?: number;
    warning?: number;
    critical?: number;
    maintenance?: number;
  };
  recent_changes?: number;
  automation_coverage?: number;
  generated_at?: string;
  [key: string]: unknown;
};

export type ResourceGroupListResponse = {
  items: ResourceGroup[];
  pagination?: PaginationMeta;
};

export type ResourceStatistics = {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
  maintenance: number;
  groups: number;
  automationCoverage?: number;
  offline?: number;
  lastUpdatedAt?: string;
};

export type ResourceTopologyNode = {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  groupIds: string[];
  metric?: ResourceMetricSnapshot;
  importance?: number;
  region?: string;
};

export type ResourceTopologyEdge = {
  id: string;
  source: string;
  target: string;
  relation?: string;
  bandwidthMbps?: number;
  latencyMs?: number;
  status?: ResourceStatus;
};

export type ResourceTopologyGraph = {
  nodes: ResourceTopologyNode[];
  edges: ResourceTopologyEdge[];
  updatedAt?: string;
};

export type ResourceGroupWithInsights = ResourceGroup & {
  memberCount: number;
  healthBreakdown: {
    healthy: number;
    warning: number;
    critical: number;
    maintenance: number;
  };
  recentChanges?: number;
};

export type ResourceFilter = Pick<ResourceQueryParams, 'search' | 'status' | 'teamId' | 'groupId' | 'tags'>;
