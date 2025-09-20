import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PaginationMeta,
  Resource,
  ResourceListResponse,
  ResourceQueryParams,
  TagFilter,
  TagFilterOperator,
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

const TAG_FILTER_OPERATORS: TagFilterOperator[] = ['eq', 'neq', 'in', 'not_in', 'regex', 'not_regex'];

const normalizeTagFilters = (filters: TagFilter[] | undefined): TagFilter[] => {
  if (!Array.isArray(filters)) {
    return [];
  }
  return filters
    .map((filter) => {
      if (!filter || typeof filter !== 'object') {
        return null;
      }
      const key = typeof filter.key === 'string' ? filter.key.trim() : '';
      if (!key) {
        return null;
      }
      const operator = TAG_FILTER_OPERATORS.includes(filter.operator)
        ? filter.operator
        : 'eq';
      const values = Array.isArray(filter.values)
        ? filter.values
            .map((value) => (typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''))
            .filter((value) => Boolean(value))
        : [];
      return {
        key,
        operator,
        values,
      };
    })
    .filter((filter): filter is TagFilter => Boolean(filter));
};

const safeCreateRegExp = (pattern: string) => {
  try {
    return new RegExp(pattern);
  } catch (_error) {
    return null;
  }
};

const extractTagValues = (resource: Resource, key: string): string[] => {
  if (!resource || !Array.isArray(resource.tags)) {
    return [];
  }
  return resource.tags
    .filter((tag) => tag && tag.key === key)
    .map((tag) => tag.value)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
};

const matchesTagFilter = (resource: Resource, filter: TagFilter): boolean => {
  const values = extractTagValues(resource, filter.key);
  const primaryValue = filter.values[0];

  switch (filter.operator) {
    case 'eq':
      if (!primaryValue) {
        return true;
      }
      return values.includes(primaryValue);
    case 'neq':
      if (!primaryValue) {
        return true;
      }
      return !values.includes(primaryValue);
    case 'in':
      if (filter.values.length === 0) {
        return true;
      }
      return filter.values.some((candidate) => values.includes(candidate));
    case 'not_in':
      if (filter.values.length === 0) {
        return true;
      }
      return filter.values.every((candidate) => !values.includes(candidate));
    case 'regex': {
      if (!primaryValue) {
        return true;
      }
      const regex = safeCreateRegExp(primaryValue);
      if (!regex) {
        return false;
      }
      return values.some((candidate) => regex.test(candidate));
    }
    case 'not_regex': {
      if (!primaryValue) {
        return true;
      }
      const regex = safeCreateRegExp(primaryValue);
      if (!regex) {
        return true;
      }
      return values.every((candidate) => !regex.test(candidate));
    }
    default:
      return true;
  }
};

const applyTagFilters = (resources: Resource[], filters: TagFilter[] = []): Resource[] => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return resources;
  }
  return resources.filter((resource) => filters.every((filter) => matchesTagFilter(resource, filter)));
};

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
  tagFilters: normalizeTagFilters(query.tagFilters),
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
  if (query.tagFilters.length > 0) {
    params.set('tag_filters', JSON.stringify(query.tagFilters));
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

  const resolvedPagination: PaginationMeta = pagination
    ? {
        page: typeof pagination.page === 'number' ? pagination.page : query.page,
        page_size: typeof pagination.page_size === 'number' ? pagination.page_size : query.pageSize,
        total: typeof pagination.total === 'number' ? pagination.total : normalized.length,
        total_pages: typeof pagination.total_pages === 'number'
          ? pagination.total_pages
          : Math.max(1, Math.ceil((typeof pagination.total === 'number' ? pagination.total : normalized.length) / query.pageSize)),
      }
    : {
        page: query.page,
        page_size: query.pageSize,
        total: normalized.length,
        total_pages: Math.max(1, Math.ceil(normalized.length / query.pageSize)),
      };

  return {
    resources: normalized,
    pagination: resolvedPagination,
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
    Array.isArray(query.tagFilters) ? JSON.stringify(query.tagFilters) : '',
  ]);

  const [resources, setResources] = useState<Resource[]>(() => {
    const initial = filterResources(fallbackResources, normalizedQuery);
    const filtered = applyTagFilters(initial, normalizedQuery.tagFilters);
    return paginateResources(filtered, normalizedQuery.page, normalizedQuery.pageSize).items;
  });
  const [pagination, setPagination] = useState<PaginationMeta>(() => (
    paginateResources(
      applyTagFilters(filterResources(fallbackResources, normalizedQuery), normalizedQuery.tagFilters),
      normalizedQuery.page,
      normalizedQuery.pageSize,
    ).pagination
  ));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState(true);

  useEffect(() => {
    const filtered = filterResources(fallbackResources, normalizedQuery);
    const filteredByTags = applyTagFilters(filtered, normalizedQuery.tagFilters);
    const paginated = paginateResources(filteredByTags, normalizedQuery.page, normalizedQuery.pageSize);
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
        const filteredByTags = applyTagFilters(payload.resources, normalizedQuery.tagFilters);
        const paginated = paginateResources(filteredByTags, normalizedQuery.page, normalizedQuery.pageSize);
        setResources(paginated.items);
        setPagination(paginated.pagination);
        setIsFallback(payload.usedFallback);
        setError(null);
      } catch (err) {
        setError(err);
        const filtered = filterResources(fallbackResources, normalizedQuery);
        const filteredByTags = applyTagFilters(filtered, normalizedQuery.tagFilters);
        const paginated = paginateResources(filteredByTags, normalizedQuery.page, normalizedQuery.pageSize);
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
