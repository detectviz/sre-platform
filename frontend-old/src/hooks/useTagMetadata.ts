import { useCallback, useEffect, useMemo, useState } from 'react';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';
import type { TagKeyMetadata, TagMetadataResponse, TagValueMode, TagValueOption } from '../types/tags';

const buildFallbackTagMetadata = (): TagKeyMetadata[] => {
  const tagKeysRaw = Array.isArray((fallbackDb as Record<string, unknown>).tag_keys)
    ? ((fallbackDb as Record<string, unknown>).tag_keys as Record<string, unknown>[])
    : [];
  const allowedValuesRaw = Array.isArray((fallbackDb as Record<string, unknown>).tag_allowed_values)
    ? ((fallbackDb as Record<string, unknown>).tag_allowed_values as Record<string, unknown>[])
    : [];
  const resourceTagsRaw = Array.isArray((fallbackDb as Record<string, unknown>).resource_tags)
    ? ((fallbackDb as Record<string, unknown>).resource_tags as Record<string, unknown>[])
    : [];

  const tagKeyById = new Map<string, Record<string, unknown>>();
  const tagKeyNames = new Set<string>();

  tagKeysRaw.forEach((tagKey) => {
    const keyName = typeof tagKey.key_name === 'string'
      ? tagKey.key_name
      : typeof tagKey.key === 'string'
        ? tagKey.key
        : typeof tagKey.name === 'string'
          ? tagKey.name
          : null;
    if (!keyName) {
      return;
    }
    const id = typeof tagKey.id === 'string' ? tagKey.id : keyName;
    tagKeyById.set(id, { ...tagKey, key_name: keyName });
    tagKeyNames.add(keyName);
  });

  const allowedByKeyId = new Map<string, TagValueOption[]>();
  allowedValuesRaw.forEach((row) => {
    const keyId = typeof row.tag_key_id === 'string'
      ? row.tag_key_id
      : typeof row.tagKeyId === 'string'
        ? row.tagKeyId
        : undefined;
    if (!keyId) {
      return;
    }
    if (!allowedByKeyId.has(keyId)) {
      allowedByKeyId.set(keyId, []);
    }
    allowedByKeyId.get(keyId)!.push({
      value: typeof row.value === 'string' ? row.value : '',
      label: typeof row.label === 'string' ? row.label : typeof row.value === 'string' ? row.value : undefined,
      color: typeof row.color === 'string' ? row.color : null,
    });
  });

  const statsByKey = new Map<string, { total: number; counts: Map<string, number> }>();

  const registerValue = (key: unknown, value: unknown) => {
    if (typeof key !== 'string' || !key.trim()) {
      return;
    }
    const normalizedKey = key.trim();
    const normalizedValue = typeof value === 'string'
      ? value.trim()
      : value === null || value === undefined
        ? ''
        : String(value).trim();
    if (!normalizedValue) {
      return;
    }
    if (!statsByKey.has(normalizedKey)) {
      statsByKey.set(normalizedKey, { total: 0, counts: new Map() });
    }
    const stats = statsByKey.get(normalizedKey)!;
    const previous = stats.counts.get(normalizedValue) ?? 0;
    stats.counts.set(normalizedValue, previous + 1);
    stats.total += 1;
  };

  resourceTagsRaw.forEach((record) => {
    const tagKeyId = typeof record.tag_key_id === 'string'
      ? record.tag_key_id
      : typeof record.tagKeyId === 'string'
        ? record.tagKeyId
        : undefined;
    const derivedKey = tagKeyId && tagKeyById.has(tagKeyId)
      ? (tagKeyById.get(tagKeyId)!.key_name as string)
      : typeof record.tag_key === 'string'
        ? record.tag_key
        : typeof record.key === 'string'
          ? record.key
          : undefined;
    const tagValue = typeof record.tag_value === 'string'
      ? record.tag_value
      : typeof record.value === 'string'
        ? record.value
        : undefined;
    registerValue(derivedKey, tagValue);
  });

  const metadataList: TagKeyMetadata[] = [];

  const buildMetadata = (key: string, tagKey?: Record<string, unknown>) => {
    const stats = statsByKey.get(key) ?? { total: 0, counts: new Map<string, number>() };
    const allowed = tagKey
      ? (allowedByKeyId.get(tagKey.id as string) || allowedByKeyId.get(tagKey.key_name as string) || [])
      : [];
    const allowedWithUsage = allowed.map((entry) => ({
      value: entry.value,
      label: entry.label ?? entry.value,
      color: entry.color ?? null,
      usageCount: stats.counts.get(entry.value) ?? 0,
    }));

    const sortedCounts = Array.from(stats.counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => {
        const diff = b.count - a.count;
        return diff !== 0 ? diff : a.value.localeCompare(b.value);
      });

    const sampleValues = (allowedWithUsage.length > 0 ? allowedWithUsage : sortedCounts.slice(0, 10).map((item) => ({
      value: item.value,
      label: item.value,
      color: null,
      usageCount: item.count,
    })));

    const distinctCount = stats.counts.size;
    const inferredMode: TagValueMode = allowedWithUsage.length > 0
      ? 'ENUM'
      : typeof tagKey?.validation_regex === 'string'
        ? 'DYNAMIC'
        : distinctCount <= 40
          ? 'DYNAMIC'
          : 'FREEFORM';

    metadataList.push({
      key,
      label: key,
      description: typeof tagKey?.description === 'string' ? tagKey.description : null,
      category: typeof tagKey?.compliance_category === 'string' ? tagKey.compliance_category : null,
      isRequired: Boolean(tagKey?.is_required),
      validationRegex: typeof tagKey?.validation_regex === 'string' ? tagKey.validation_regex : null,
      valueMode: inferredMode,
      usageCount: typeof tagKey?.usage_count === 'number' ? tagKey.usage_count : stats.total,
      distinctCount,
      allowedValues: allowedWithUsage,
      sampleValues,
    });
  };

  tagKeysRaw.forEach((tagKey) => {
    const keyName = typeof tagKey.key_name === 'string'
      ? tagKey.key_name
      : typeof tagKey.key === 'string'
        ? tagKey.key
        : typeof tagKey.name === 'string'
          ? tagKey.name
          : null;
    if (!keyName) {
      return;
    }
    buildMetadata(keyName, tagKey);
  });

  statsByKey.forEach((_stats, key) => {
    if (!tagKeyNames.has(key)) {
      buildMetadata(key);
    }
  });

  metadataList.sort((a, b) => {
    const diff = (b.usageCount ?? 0) - (a.usageCount ?? 0);
    return diff !== 0 ? diff : a.key.localeCompare(b.key);
  });

  return metadataList;
};

const fallbackMetadataCache = buildFallbackTagMetadata();

const mapApiTag = (tag: TagMetadataResponse['tags'][number]): TagKeyMetadata => {
  const allowedValues = Array.isArray(tag.allowed_values)
    ? tag.allowed_values.map((value) => ({
        value: value.value,
        label: value.label || value.value,
        color: value.color ?? null,
        usageCount: value.usage_count,
      }))
    : undefined;
  const sampleValues = Array.isArray(tag.sample_values)
    ? tag.sample_values.map((value) => ({
        value: value.value,
        label: value.label || value.value,
        color: value.color ?? null,
        usageCount: value.usage_count,
      }))
    : undefined;
  return {
    key: tag.key,
    label: tag.label || tag.key,
    description: tag.description ?? null,
    category: tag.category ?? null,
    isRequired: Boolean(tag.is_required),
    validationRegex: tag.validation_regex ?? null,
    valueMode: tag.value_mode || (allowedValues && allowedValues.length > 0 ? 'ENUM' : 'FREEFORM'),
    usageCount: tag.usage_count,
    distinctCount: tag.distinct_count,
    allowedValues,
    sampleValues,
  };
};

const parseTagMetadataResponse = (payload: unknown): TagKeyMetadata[] => {
  if (!payload || typeof payload !== 'object') {
    return fallbackMetadataCache;
  }
  const objectPayload = payload as TagMetadataResponse;
  if (Array.isArray(objectPayload.tags)) {
    return objectPayload.tags.map((tag) => mapApiTag(tag));
  }
  if (Array.isArray(payload)) {
    return (payload as TagKeyMetadata[]).map((tag) => ({
      ...tag,
      valueMode: tag.valueMode ?? 'FREEFORM',
    }));
  }
  return fallbackMetadataCache;
};

export type UseTagMetadataResult = {
  tags: TagKeyMetadata[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  refresh: () => void;
};

const useTagMetadata = (): UseTagMetadataResult => {
  const [tags, setTags] = useState<TagKeyMetadata[]>(fallbackMetadataCache);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);
  const [isFallback, setIsFallback] = useState<boolean>(true);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetchJson<TagMetadataResponse>('/tags', { signal });
      const parsed = parseTagMetadataResponse(response);
      if (!signal?.aborted) {
        setTags(parsed);
        setIsFallback(false);
        setError(null);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setTags(fallbackMetadataCache);
        setIsFallback(true);
        setError(err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(() => ({
    tags,
    loading,
    error,
    isFallback,
    refresh,
  }), [tags, loading, error, isFallback, refresh]);
};

export default useTagMetadata;
