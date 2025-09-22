import { useEffect, useMemo, useState } from 'react';
import type {
  Resource,
  ResourceGroup,
  ResourceTopologyEdge,
  ResourceTopologyGraph,
  ResourceTopologyNode,
} from '../types/resources';
import { fetchJson } from '../utils/apiClient';
import { buildTopologyFromResources } from '../utils/resourceTransforms';

const TOPOLOGY_STATUSES = ['HEALTHY', 'WARNING', 'CRITICAL', 'SILENCED', 'MAINTENANCE', 'UNKNOWN'] as const;

type TopologyStatus = (typeof TOPOLOGY_STATUSES)[number];

const parseStatus = (value: unknown): TopologyStatus => {
  if (typeof value !== 'string') {
    return 'UNKNOWN';
  }
  const normalized = value.trim().toUpperCase();
  return TOPOLOGY_STATUSES.includes(normalized as TopologyStatus)
    ? (normalized as TopologyStatus)
    : 'UNKNOWN';
};

type UseResourceTopologyOptions = {
  enabled?: boolean;
  groupId?: string;
  layout?: string;
};

type UseResourceTopologyResult = {
  topology: ResourceTopologyGraph;
  loading: boolean;
  error: unknown;
  isFallback: boolean;
};

const isTopologyGraph = (value: unknown): value is ResourceTopologyGraph => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const graph = value as Record<string, unknown>;
  return Array.isArray(graph.nodes) && Array.isArray(graph.edges);
};

const normalizeTopologyPayload = (value: unknown, fallback: ResourceTopologyGraph): ResourceTopologyGraph => {
  if (!isTopologyGraph(value)) {
    return fallback;
  }
  const nodesRaw = (value.nodes ?? []) as unknown[];
  const edgesRaw = (value.edges ?? []) as unknown[];

  const nodes: ResourceTopologyNode[] = nodesRaw.map((item, index) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    const idCandidate = raw.id ?? raw.key ?? raw.resource_id ?? `node_${index}`;
    const id = typeof idCandidate === 'string' ? idCandidate : `node_${index}`;
    const status = parseStatus(raw.status);
    return {
      id,
      name: typeof raw.name === 'string' ? raw.name : id,
      type: typeof raw.type === 'string' ? raw.type : 'unspecified',
      status,
      groupIds: Array.isArray(raw.groupIds)
        ? (raw.groupIds as unknown[]).map((value) => (typeof value === 'string' ? value : String(value)))
        : [],
      metric: typeof raw.metric === 'object' && raw.metric !== null
        ? (raw.metric as ResourceTopologyNode['metric'])
        : undefined,
      importance: typeof raw.importance === 'number' ? raw.importance : undefined,
      region: typeof raw.region === 'string' ? raw.region : undefined,
    };
  });

  const edges: ResourceTopologyEdge[] = edgesRaw.map((item, index) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    const source = typeof raw.source === 'string' ? raw.source : '';
    const target = typeof raw.target === 'string' ? raw.target : '';
    return {
      id: typeof raw.id === 'string' ? raw.id : `edge_${index}`,
      source,
      target,
      relation: typeof raw.relation === 'string' ? raw.relation : undefined,
      bandwidthMbps: typeof raw.bandwidthMbps === 'number' ? raw.bandwidthMbps : undefined,
      latencyMs: typeof raw.latencyMs === 'number' ? raw.latencyMs : undefined,
      status: typeof raw.status === 'string' ? parseStatus(raw.status) : undefined,
    };
  }).filter((edge) => edge.source && edge.target);

  return {
    nodes,
    edges,
    updatedAt: typeof (value as Record<string, unknown>).updatedAt === 'string'
      ? ((value as Record<string, unknown>).updatedAt as string)
      : fallback.updatedAt,
  };
};

const useResourceTopology = (
  resources: Resource[],
  resourceGroups: ResourceGroup[] = [],
  options: UseResourceTopologyOptions = {},
): UseResourceTopologyResult => {
  const baseline = useMemo(
    () => buildTopologyFromResources(resources, resourceGroups),
    [resources, resourceGroups],
  );

  const [topology, setTopology] = useState<ResourceTopologyGraph>(baseline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    setTopology(baseline);
    setIsFallback(true);
  }, [baseline]);

  useEffect(() => {
    if (options.enabled === false) {
      return;
    }

    const controller = new AbortController();

    const fetchTopology = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (options.groupId) params.set('group_id', options.groupId);
        if (options.layout) params.set('layout', options.layout);
        const path = params.toString() ? `/topology?${params.toString()}` : '/topology';
        const response = await fetchJson<unknown>(path, { signal: controller.signal });
        const normalized = normalizeTopologyPayload(response, baseline);
        setTopology(normalized);
        setIsFallback(!isTopologyGraph(response));
        setError(null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err);
          setTopology(baseline);
          setIsFallback(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTopology();

    return () => controller.abort();
  }, [baseline, options.groupId, options.layout, options.enabled]);

  return {
    topology,
    loading,
    error,
    isFallback,
  };
};

export default useResourceTopology;
