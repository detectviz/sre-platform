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

export type ResourceMetricSnapshot = {
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkIn?: number;
  networkOut?: number;
  latencyMs?: number;
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
};

export type ResourceGroup = {
  id: string;
  name: string;
  description?: string;
  responsibleTeamId?: string;
  ownerName?: string;
  memberIds: string[];
  tags: ResourceTag[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
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
