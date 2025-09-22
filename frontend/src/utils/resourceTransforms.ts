import type {
  Resource,
  ResourceAction,
  ResourceEventSummary,
  ResourceFilter,
  ResourceGroup,
  ResourceGroupMetadata,
  ResourceGroupWithInsights,
  ResourceMetricHistory,
  ResourceMetricSnapshot,
  ResourceObservability,
  ResourceStatistics,
  ResourceStatus,
  ResourceTag,
  ResourceTopologyEdge,
  ResourceTopologyGraph,
  ResourceTopologyNode,
} from '../types/resources';

const statusOrder: Record<ResourceStatus, number> = {
  CRITICAL: 4,
  WARNING: 3,
  MAINTENANCE: 2,
  SILENCED: 1,
  HEALTHY: 0,
  UNKNOWN: 0,
};

const toResourceStatus = (value: unknown): ResourceStatus => {
  if (typeof value !== 'string') {
    return 'UNKNOWN';
  }
  const normalized = value.trim().toUpperCase();
  if (['HEALTHY', 'OK', 'UP'].includes(normalized)) {
    return 'HEALTHY';
  }
  if (['WARNING', 'WARN', 'DEGRADED'].includes(normalized)) {
    return 'WARNING';
  }
  if (['CRITICAL', 'DOWN', 'ERROR', 'ALERTING'].includes(normalized)) {
    return 'CRITICAL';
  }
  if (['SILENCED', 'SILENCE'].includes(normalized)) {
    return 'SILENCED';
  }
  if (['MAINTENANCE', 'MAINTAINING'].includes(normalized)) {
    return 'MAINTENANCE';
  }
  return 'UNKNOWN';
};

const normalizeTag = (input: unknown): ResourceTag | null => {
  if (typeof input === 'string') {
    return { key: input, value: input };
  }
  if (input && typeof input === 'object') {
    const tag = input as Record<string, unknown>;
    const key = tag.key ?? tag.name;
    const value = tag.value ?? tag.label ?? tag.name;
    if (typeof key === 'string' && key.trim()) {
      return {
        key: key.trim(),
        value: typeof value === 'string' ? value.trim() : key.trim(),
      };
    }
  }
  return null;
};

const parseNumber = (input: unknown): number | undefined => {
  const numberValue = typeof input === 'number' ? input : Number(input);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const parseNumberArray = (input: unknown): number[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((value) => parseNumber(value))
    .filter((value): value is number => typeof value === 'number');
};

const parseMetricHistoryPayload = (input: unknown): ResourceMetricHistory | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }
  const raw = input as Record<string, unknown>;
  const timestamps = Array.isArray(raw.timestamps)
    ? raw.timestamps.map((timestamp) => String(timestamp))
    : [];

  const cpuSeries = parseNumberArray(
    raw.cpuSeries ?? raw.cpu_series ?? raw.cpu_usage ?? raw.cpu,
  );
  const memorySeries = parseNumberArray(
    raw.memorySeries ?? raw.memory_series ?? raw.memory_usage ?? raw.memory,
  );

  if (timestamps.length === 0 && cpuSeries.length === 0 && memorySeries.length === 0) {
    return undefined;
  }

  return {
    timestamps,
    cpuSeries: cpuSeries.length > 0 ? cpuSeries : undefined,
    memorySeries: memorySeries.length > 0 ? memorySeries : undefined,
  };
};

const parseResourceActionsPayload = (input: unknown): ResourceAction[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const raw = item as Record<string, unknown>;
      const key = typeof raw.key === 'string'
        ? raw.key
        : typeof raw.id === 'string'
          ? raw.id
          : `action_${index}`;
      const label = typeof raw.label === 'string'
        ? raw.label
        : typeof raw.name === 'string'
          ? raw.name
          : key;

      if (!key || !label) {
        return null;
      }

      const action: ResourceAction = {
        key,
        label,
        type: typeof raw.type === 'string' ? (raw.type as ResourceAction['type']) : undefined,
        url: typeof raw.url === 'string' ? raw.url : typeof raw.href === 'string' ? raw.href : undefined,
        target: typeof raw.target === 'string' ? raw.target : undefined,
        description: typeof raw.description === 'string' ? raw.description : undefined,
      };

      return action;
    })
    .filter((action): action is ResourceAction => Boolean(action));
};

const parseObservabilityPayload = (input: unknown): ResourceObservability | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }
  const raw = input as Record<string, unknown>;
  const grafanaUrl = typeof raw.grafana_url === 'string'
    ? raw.grafana_url
    : typeof raw.grafanaUrl === 'string'
      ? raw.grafanaUrl
      : undefined;
  const logsUrl = typeof raw.logs_url === 'string'
    ? raw.logs_url
    : typeof raw.logsUrl === 'string'
      ? raw.logsUrl
      : undefined;
  const runbookUrl = typeof raw.runbook_url === 'string'
    ? raw.runbook_url
    : typeof raw.runbookUrl === 'string'
      ? raw.runbookUrl
      : undefined;

  if (!grafanaUrl && !logsUrl && !runbookUrl) {
    return undefined;
  }

  return {
    grafanaUrl,
    logsUrl,
    runbookUrl,
  };
};

const parseRelatedEventsPayload = (input: unknown): ResourceEventSummary[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const raw = item as Record<string, unknown>;
      const id = typeof raw.id === 'string'
        ? raw.id
        : typeof raw.event_id === 'string'
          ? raw.event_id
          : undefined;
      if (!id) {
        return null;
      }

      const summary: ResourceEventSummary = {
        id,
        summary: typeof raw.summary === 'string'
          ? raw.summary
          : typeof raw.title === 'string'
            ? raw.title
            : undefined,
        severity: typeof raw.severity === 'string' ? raw.severity : undefined,
        status: typeof raw.status === 'string' ? raw.status : undefined,
        updatedAt: typeof raw.updated_at === 'string'
          ? raw.updated_at
          : typeof raw.updatedAt === 'string'
            ? raw.updatedAt
            : undefined,
      };

      return summary;
    })
    .filter((event): event is ResourceEventSummary => Boolean(event));
};

const parseStringArray = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map((value) => (typeof value === 'string' ? value.trim() : null))
    .filter((value): value is string => Boolean(value));
};

export const normalizeResource = (input: unknown, fallbackIndex?: number): Resource => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const rawTags = Array.isArray(raw.tags) ? raw.tags : [];
  const rawGroups = Array.isArray(raw.groups) ? raw.groups : [];

  const tags = rawTags
    .map((item) => normalizeTag(item))
    .filter((tag): tag is ResourceTag => Boolean(tag));

  const groups = rawGroups
    .map((item) => {
      if (typeof item === 'string' && item.trim()) {
        return item.trim();
      }
      if (item && typeof item === 'object') {
        const group = item as Record<string, unknown>;
        const id = group.id ?? group.key ?? group.name;
        if (typeof id === 'string' && id.trim()) {
          return id.trim();
        }
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));

  const metricsSource = typeof raw.metrics === 'object' && raw.metrics !== null
    ? (raw.metrics as Record<string, unknown>)
    : {};

  const metrics: ResourceMetricSnapshot = {
    cpuUsage: parseNumber(raw.cpu_usage ?? raw.cpuUsage ?? metricsSource['cpu_usage'] ?? metricsSource['cpuUsage']),
    memoryUsage: parseNumber(raw.memory_usage ?? raw.memoryUsage ?? metricsSource['memory_usage'] ?? metricsSource['memoryUsage']),
    diskUsage: parseNumber(raw.disk_usage ?? raw.diskUsage ?? metricsSource['disk_usage'] ?? metricsSource['diskUsage']),
    networkIn: parseNumber(raw.network_in ?? raw.networkIn ?? metricsSource['network_in'] ?? metricsSource['networkIn']),
    networkOut: parseNumber(raw.network_out ?? raw.networkOut ?? metricsSource['network_out'] ?? metricsSource['networkOut']),
    latencyMs: parseNumber(raw.latency_ms ?? raw.latencyMs ?? metricsSource['latency_ms'] ?? metricsSource['latencyMs']),
  };

  const idCandidate = raw.id ?? raw.key ?? raw.resource_id ?? raw.name;
  const id = typeof idCandidate === 'string' && idCandidate.trim()
    ? idCandidate.trim()
    : `resource_${String(fallbackIndex ?? Date.now())}`;

  const relatedIncidents = parseNumber(raw.related_incidents ?? raw.incident_count);
  const alarms = Array.isArray(raw.alarms) ? raw.alarms.length : undefined;

  const metricsHistory = parseMetricHistoryPayload(
    raw.metrics_history ?? raw.metric_history ?? raw.metricsHistory,
  );

  const observability = parseObservabilityPayload(raw.observability);

  const healthReasonsRaw = Array.isArray(raw.health_reasons)
    ? parseStringArray(raw.health_reasons)
    : Array.isArray(raw.healthReasons)
      ? parseStringArray(raw.healthReasons)
      : typeof raw.health_reason === 'string'
        ? [raw.health_reason]
        : [];

  const actions = parseResourceActionsPayload(raw.actions);
  const relatedEvents = parseRelatedEventsPayload(raw.related_events ?? raw.relatedEvents);

  const healthSummary = typeof raw.health_summary === 'string'
    ? raw.health_summary
    : typeof raw.healthSummary === 'string'
      ? raw.healthSummary
      : healthReasonsRaw[0];

  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : id,
    type: typeof raw.type === 'string' && raw.type.trim()
      ? raw.type.trim()
      : typeof raw.resource_type === 'string' && raw.resource_type.trim()
        ? raw.resource_type.trim()
        : 'unspecified',
    status: toResourceStatus(raw.status ?? raw.health_status ?? raw.state),
    ipAddress: typeof raw.ip_address === 'string' ? raw.ip_address : typeof raw.ipAddress === 'string' ? raw.ipAddress : undefined,
    location: typeof raw.location === 'string' ? raw.location : typeof raw.region === 'string' ? raw.region : undefined,
    provider: typeof raw.provider === 'string' ? raw.provider : typeof raw.cloud_provider === 'string' ? raw.cloud_provider : undefined,
    teamId: typeof raw.team_id === 'string' ? raw.team_id : typeof raw.teamId === 'string' ? raw.teamId : undefined,
    environment: typeof raw.environment === 'string' ? raw.environment : undefined,
    tags,
    groups,
    relatedIncidents: relatedIncidents ?? alarms,
    metrics,
    metricsHistory,
    healthSummary,
    healthReasons: healthReasonsRaw,
    actions,
    observability,
    relatedEvents,
    lastCheckedAt: typeof raw.last_checked_at === 'string' ? raw.last_checked_at : typeof raw.lastCheckedAt === 'string' ? raw.lastCheckedAt : undefined,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
};

export const normalizeResources = (input: unknown[]): Resource[] =>
  input.map((item, index) => normalizeResource(item, index));

export const normalizeResourceGroup = (input: unknown, fallbackIndex?: number): ResourceGroup => {
  const raw = (input ?? {}) as Record<string, unknown>;
  const tagsRaw = Array.isArray(raw.tags) ? raw.tags : [];
  const memberIdsSource = Array.isArray(raw.members)
    ? raw.members
    : Array.isArray(raw.member_ids)
      ? raw.member_ids
      : [];

  const tags = tagsRaw
    .map((item) => normalizeTag(item))
    .filter((tag): tag is ResourceTag => Boolean(tag));

  const memberIds = memberIdsSource
    .map((value) => (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : null))
    .filter((value): value is string => Boolean(value));

  const idCandidate = raw.id ?? raw.key ?? raw.group_id ?? raw.name;
  const id = typeof idCandidate === 'string' && idCandidate.trim()
    ? idCandidate.trim()
    : `resource_group_${String(fallbackIndex ?? Date.now())}`;

  const metadata = typeof raw.metadata === 'object' && raw.metadata !== null
    ? (raw.metadata as ResourceGroupMetadata)
    : undefined;

  return {
    id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : id,
    description: typeof raw.description === 'string' ? raw.description : undefined,
    responsibleTeamId: typeof raw.responsible_team_id === 'string'
      ? raw.responsible_team_id
      : typeof raw.responsibleTeam === 'string'
        ? raw.responsibleTeam
        : undefined,
    ownerName: typeof raw.owner === 'string' ? raw.owner : undefined,
    memberIds,
    tags,
    status: typeof raw.status === 'string' ? raw.status : undefined,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
    metadata,
  };
};

export const normalizeResourceGroups = (input: unknown[]): ResourceGroup[] =>
  input.map((item, index) => normalizeResourceGroup(item, index));

export const filterResources = (resources: Resource[], filter: ResourceFilter = {}): Resource[] => {
  const keyword = filter.search?.trim().toLowerCase();
  const statusFilter = filter.status && filter.status !== 'ALL' ? filter.status : null;
  const teamFilter = filter.teamId?.trim();
  const groupFilter = filter.groupId?.trim();
  const tagFilter = Array.isArray(filter.tags) ? filter.tags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim().toLowerCase()) : [];

  return resources.filter((resource) => {
    if (keyword) {
      const haystack = [
        resource.name,
        resource.ipAddress,
        resource.location,
        resource.type,
        resource.tags.map((tag) => `${tag.key}:${tag.value}`).join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(keyword)) {
        return false;
      }
    }

    if (statusFilter && resource.status !== statusFilter) {
      return false;
    }

    if (teamFilter && resource.teamId !== teamFilter) {
      return false;
    }

    if (groupFilter && !resource.groups.includes(groupFilter)) {
      return false;
    }

    if (tagFilter.length > 0) {
      const resourceTagStrings = resource.tags.map((tag) => `${tag.key}:${tag.value}`.toLowerCase());
      const hasAllTags = tagFilter.every((tag) => resourceTagStrings.some((candidate) => candidate.includes(tag)));
      if (!hasAllTags) {
        return false;
      }
    }

    return true;
  });
};

export const paginateResources = <T>(items: T[], page: number, pageSize: number) => {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const total = items.length;
  const offset = (safePage - 1) * safePageSize;
  return {
    items: items.slice(offset, offset + safePageSize),
    pagination: {
      page: safePage,
      page_size: safePageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / safePageSize)),
    },
  };
};

export const calculateResourceStatistics = (resources: Resource[], groups: ResourceGroup[] = []): ResourceStatistics => {
  const counts: Record<ResourceStatus, number> = {
    HEALTHY: 0,
    WARNING: 0,
    CRITICAL: 0,
    SILENCED: 0,
    MAINTENANCE: 0,
    UNKNOWN: 0,
  };

  let automationManaged = 0;
  let offline = 0;
  let latestUpdatedAt: string | undefined;

  resources.forEach((resource) => {
    counts[resource.status] = (counts[resource.status] ?? 0) + 1;

    if (resource.tags.some((tag) => /auto|automation|managed/i.test(`${tag.key}:${tag.value}`))) {
      automationManaged += 1;
    }

    if (resource.status === 'UNKNOWN') {
      offline += 1;
    }

    if (resource.updatedAt) {
      if (!latestUpdatedAt || new Date(resource.updatedAt).getTime() > new Date(latestUpdatedAt).getTime()) {
        latestUpdatedAt = resource.updatedAt;
      }
    }
  });

  const total = resources.length;
  const automationCoverage = total > 0 ? Math.round((automationManaged / total) * 100) : 0;

  return {
    total,
    healthy: counts.HEALTHY ?? 0,
    warning: counts.WARNING ?? 0,
    critical: counts.CRITICAL ?? 0,
    maintenance: counts.MAINTENANCE ?? 0,
    groups: groups.length,
    automationCoverage,
    offline,
    lastUpdatedAt: latestUpdatedAt,
  };
};

const combineStatus = (a: ResourceStatus, b: ResourceStatus): ResourceStatus => {
  const orderA = statusOrder[a] ?? 0;
  const orderB = statusOrder[b] ?? 0;
  return orderA >= orderB ? a : b;
};

export const buildTopologyFromResources = (
  resources: Resource[],
  groups: ResourceGroup[] = [],
): ResourceTopologyGraph => {
  const nodes: ResourceTopologyNode[] = resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
    type: resource.type,
    status: resource.status,
    groupIds: resource.groups,
    metric: resource.metrics,
    importance: resource.relatedIncidents ?? 0,
    region: resource.location,
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges: ResourceTopologyEdge[] = [];
  const seenEdges = new Set<string>();

  const pushEdge = (source: string, target: string, relation: string) => {
    if (source === target || !nodeMap.has(source) || !nodeMap.has(target)) {
      return;
    }
    const key = `${source}|${target}|${relation}`;
    if (seenEdges.has(key)) {
      return;
    }
    seenEdges.add(key);
    const sourceNode = nodeMap.get(source)!;
    const targetNode = nodeMap.get(target)!;
    edges.push({
      id: key,
      source,
      target,
      relation,
      status: combineStatus(sourceNode.status, targetNode.status),
      bandwidthMbps: sourceNode.metric?.networkOut ?? targetNode.metric?.networkIn,
      latencyMs: Math.max(
        sourceNode.metric?.latencyMs ?? 0,
        targetNode.metric?.latencyMs ?? 0,
      ) || undefined,
    });
  };

  const groupMemberMap = new Map<string, string[]>();
  groups.forEach((group) => {
    if (group.memberIds.length > 0) {
      groupMemberMap.set(group.id, group.memberIds.filter((id) => nodeMap.has(id)));
    }
  });

  groupMemberMap.forEach((memberIds, groupId) => {
    if (memberIds.length < 2) {
      return;
    }
    const [anchor, ...rest] = memberIds;
    rest.forEach((member) => pushEdge(anchor, member, `group:${groupId}`));
  });

  const typeBuckets = new Map<string, ResourceTopologyNode[]>();
  nodes.forEach((node) => {
    const bucket = typeBuckets.get(node.type) ?? [];
    bucket.push(node);
    typeBuckets.set(node.type, bucket);
  });

  const applicationNodes = typeBuckets.get('application') ?? typeBuckets.get('service') ?? [];
  const databaseNodes = typeBuckets.get('database') ?? [];
  const cacheNodes = typeBuckets.get('cache') ?? typeBuckets.get('redis') ?? [];

  applicationNodes.forEach((appNode) => {
    databaseNodes.forEach((dbNode) => {
      pushEdge(appNode.id, dbNode.id, 'depends_on:database');
    });
    cacheNodes.forEach((cacheNode) => {
      pushEdge(appNode.id, cacheNode.id, 'uses:cache');
    });
  });

  const updatedAt = resources.reduce<string | undefined>((latest, resource) => {
    if (!resource.updatedAt) {
      return latest;
    }
    if (!latest || new Date(resource.updatedAt).getTime() > new Date(latest).getTime()) {
      return resource.updatedAt;
    }
    return latest;
  }, undefined);

  return {
    nodes,
    edges,
    updatedAt,
  };
};

export const enrichResourceGroups = (
  groups: ResourceGroup[],
  resources: Resource[],
): ResourceGroupWithInsights[] => {
  const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));

  return groups.map((group) => {
    const breakdown = {
      healthy: 0,
      warning: 0,
      critical: 0,
      maintenance: 0,
    };

    let recentChanges = 0;

    group.memberIds.forEach((memberId) => {
      const resource = resourceMap.get(memberId);
      if (!resource) {
        return;
      }
      if (resource.status === 'HEALTHY') breakdown.healthy += 1;
      else if (resource.status === 'WARNING') breakdown.warning += 1;
      else if (resource.status === 'CRITICAL') breakdown.critical += 1;
      else if (resource.status === 'MAINTENANCE') breakdown.maintenance += 1;

      if (resource.updatedAt) {
        const updatedAt = new Date(resource.updatedAt).getTime();
        if (Number.isFinite(updatedAt) && Date.now() - updatedAt < 24 * 60 * 60 * 1000) {
          recentChanges += 1;
        }
      }
    });

    return {
      ...group,
      memberCount: group.memberIds.length,
      healthBreakdown: breakdown,
      recentChanges,
    };
  });
};
