import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PaginationMeta,
  Resource,
  ResourceListResponse,
  ResourceQueryParams,
} from '../types/resources';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';
import {
  filterResources,
  normalizeResources,
  paginateResources,
} from '../utils/resourceTransforms';

type ApiPayload = ResourceListResponse | { items?: unknown[]; pagination?: Partial<PaginationMeta> } | unknown[];

type UseResourcesResult = {
  resources: Resource[];
  pagination: PaginationMeta;
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  refresh: () => void;
};

const fallbackRawResources = Array.isArray((fallbackDb as Record<string, unknown>).resources)
  ? ((fallbackDb as Record<string, unknown>).resources as unknown[])
  : [];
const fallbackResources = normalizeResources(fallbackRawResources);

const buildQuery = (query: ResourceQueryParams = {}) => ({
  page: Math.max(1, query.page ?? 1),
  pageSize: Math.max(1, query.pageSize ?? 20),
  search: query.search?.trim() ?? '',
  status: query.status ?? 'ALL',
  teamId: query.teamId?.trim() ?? '',
  groupId: query.groupId?.trim() ?? '',
  tags: Array.isArray(query.tags)
    ? query.tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter((tag) => Boolean(tag))
    : [],
});

const serializeParams = (query: ReturnType<typeof buildQuery>) => {
  const params = new URLSearchParams();
  params.set('page', String(query.page));
  params.set('page_size', String(query.pageSize));
  if (query.search) params.set('search', query.search);
  if (query.status && query.status !== 'ALL') params.set('status', query.status.toLowerCase());
  if (query.teamId) params.set('team_id', query.teamId);
  if (query.groupId) params.set('group_id', query.groupId);
  if (query.tags.length > 0) {
    query.tags.forEach((tag) => params.append('tags', tag));
  }
  return params;
};

const ensurePagination = (
  value: Partial<PaginationMeta> | undefined,
  fallback: PaginationMeta,
): PaginationMeta => {
  if (!value) {
    return fallback;
  }
  const page = typeof value.page === 'number' && value.page > 0 ? value.page : fallback.page;
  const pageSize = typeof value.page_size === 'number' && value.page_size > 0 ? value.page_size : fallback.page_size;
  const total = typeof value.total === 'number' && value.total >= 0 ? value.total : fallback.total;
  const totalPages = typeof value.total_pages === 'number' && value.total_pages > 0
    ? value.total_pages
    : Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    page_size: pageSize,
    total,
    total_pages: totalPages,
  };
};

const extractPayload = (
  response: ApiPayload,
  query: ReturnType<typeof buildQuery>,
): { resources: Resource[]; pagination: PaginationMeta; usedFallback: boolean } => {
  let rawItems: unknown[] = [];
  let pagination: PaginationMeta | undefined;

  if (Array.isArray(response)) {
    rawItems = response;
  } else if (response && typeof response === 'object') {
    const objectPayload = response as Record<string, unknown>;
    if (Array.isArray(objectPayload.items)) {
      rawItems = objectPayload.items;
    } else if (Array.isArray(objectPayload.data)) {
      rawItems = objectPayload.data;
    } else if (Array.isArray(objectPayload.resources)) {
      rawItems = objectPayload.resources as unknown[];
    }

    if (objectPayload.pagination && typeof objectPayload.pagination === 'object') {
      pagination = ensurePagination(objectPayload.pagination as Partial<PaginationMeta>, {
        page: query.page,
        page_size: query.pageSize,
        total: rawItems.length,
        total_pages: Math.max(1, Math.ceil(rawItems.length / query.pageSize)),
      });
    }
  }

  let usedFallback = false;

  if (!rawItems.length) {
    const filteredFallback = filterResources(fallbackResources, query);
    const paginated = paginateResources(filteredFallback, query.page, query.pageSize);
    return {
      resources: paginated.items,
      pagination: paginated.pagination,
      usedFallback: true,
    };
  }

  const normalized = normalizeResources(rawItems);

  return {
    resources: normalized,
    pagination: pagination ?? {
      page: query.page,
      page_size: query.pageSize,
      total: typeof pagination?.total === 'number' ? pagination.total : normalized.length,
      total_pages: typeof pagination?.total_pages === 'number'
        ? pagination.total_pages
        : Math.max(1, Math.ceil((typeof pagination?.total === 'number' ? pagination.total : normalized.length) / query.pageSize)),
    },
    usedFallback,
  };
};

const useResources = (query: ResourceQueryParams = {}): UseResourcesResult => {
  const normalizedQuery = useMemo(() => buildQuery(query), [
    query.page,
    query.pageSize,
    query.search,
    query.status,
    query.teamId,
    query.groupId,
    Array.isArray(query.tags) ? query.tags.join('|') : '',
  ]);

  const [resources, setResources] = useState<Resource[]>(() => {
    const initial = filterResources(fallbackResources, normalizedQuery);
    return paginateResources(initial, normalizedQuery.page, normalizedQuery.pageSize).items;
  });
  const [pagination, setPagination] = useState<PaginationMeta>(() => (
    paginateResources(filterResources(fallbackResources, normalizedQuery), normalizedQuery.page, normalizedQuery.pageSize).pagination
  ));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    const filtered = filterResources(fallbackResources, normalizedQuery);
    const paginated = paginateResources(filtered, normalizedQuery.page, normalizedQuery.pageSize);
    setResources(paginated.items);
    setPagination(paginated.pagination);
    setIsFallback(true);
  }, [normalizedQuery]);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = serializeParams(normalizedQuery);
        const endpoint = params.toString() ? `/resources?${params.toString()}` : '/resources';
        const response = await fetchJson<ApiPayload>(endpoint, { signal });
        const payload = extractPayload(response, normalizedQuery);
        setResources(payload.resources);
        setPagination(payload.pagination);
        setIsFallback(payload.usedFallback);
        setError(null);
      } catch (err) {
        setError(err);
        const filtered = filterResources(fallbackResources, normalizedQuery);
        const paginated = paginateResources(filtered, normalizedQuery.page, normalizedQuery.pageSize);
        setResources(paginated.items);
        setPagination(paginated.pagination);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    },
    [normalizedQuery],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    resources,
    pagination,
    loading,
    error,
    isFallback,
    refresh,
  };
};

export default useResources;
