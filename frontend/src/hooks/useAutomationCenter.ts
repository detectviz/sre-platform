import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import fallbackDb from '../mocks/db.json';
import { fetchJson } from '../utils/apiClient';
import type {
  AutomationExecution,
  AutomationSchedule,
  AutomationScript,
  AutomationStats,
  AutomationScheduleMode,
  AutomationExecutionStatus,
} from '../types/automation';

const fallbackScriptsRaw = Array.isArray((fallbackDb as Record<string, unknown>).automation_scripts)
  ? ((fallbackDb as Record<string, unknown>).automation_scripts as unknown[])
  : [];
const fallbackSchedulesRaw = Array.isArray((fallbackDb as Record<string, unknown>).schedules)
  ? ((fallbackDb as Record<string, unknown>).schedules as unknown[])
  : [];
const fallbackExecutionsRaw = Array.isArray((fallbackDb as Record<string, unknown>).executions)
  ? ((fallbackDb as Record<string, unknown>).executions as unknown[])
  : [];

const normalizeScript = (value: Record<string, unknown>): AutomationScript => {
  const id = typeof value.id === 'string' && value.id
    ? value.id
    : typeof value.key === 'string' && value.key
      ? value.key
      : `script_${Math.random().toString(36).slice(2, 8)}`;
  const name = typeof value.name === 'string' ? value.name : '未命名腳本';
  const language = typeof value.language === 'string'
    ? value.language
    : typeof value.type === 'string'
      ? value.type
      : 'Shell';
  const category = typeof value.category === 'string' ? value.category : undefined;
  const description = typeof value.description === 'string' ? value.description : undefined;
  const owner = typeof value.owner === 'string'
    ? value.owner
    : typeof value.creator === 'string'
      ? value.creator
      : undefined;
  const repositoryUrl = typeof value.repository_url === 'string'
    ? value.repository_url
    : typeof value.repositoryUrl === 'string'
      ? value.repositoryUrl
      : undefined;
  const lastExecutedAt = typeof value.last_executed === 'string'
    ? value.last_executed
    : typeof value.lastExecutedAt === 'string'
      ? value.lastExecutedAt
      : undefined;
  const executionCount = typeof value.execution_count === 'number'
    ? value.execution_count
    : typeof value.executionCount === 'number'
      ? value.executionCount
      : undefined;
  const successRate = typeof value.success_rate === 'number'
    ? value.success_rate
    : typeof value.successRate === 'number'
      ? value.successRate
      : undefined;
  const isEnabled = value.status ? String(value.status).toLowerCase() !== 'inactive' : undefined;
  const tags = Array.isArray(value.tags)
    ? value.tags.filter((item): item is string => typeof item === 'string')
    : undefined;
  const createdAt = typeof value.created_at === 'string'
    ? value.created_at
    : typeof value.createdAt === 'string'
      ? value.createdAt
      : undefined;
  const updatedAt = typeof value.updated_at === 'string'
    ? value.updated_at
    : typeof value.updatedAt === 'string'
      ? value.updatedAt
      : undefined;
  const parameters = Array.isArray(value.params)
    ? value.params.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object').map((param) => {
        const rawDefault = param.default_value ?? param.defaultValue;
        const defaultValue = typeof rawDefault === 'string' || typeof rawDefault === 'number' || typeof rawDefault === 'boolean'
          ? rawDefault
          : undefined;
        return {
          name: typeof param.name === 'string' ? param.name : 'param',
          type: typeof param.type === 'string' ? param.type : 'string',
          label: typeof param.label === 'string' ? param.label : undefined,
          required: Boolean(param.required),
          description: typeof param.description === 'string' ? param.description : undefined,
          defaultValue,
        };
      })
    : undefined;

  return {
    id,
    name,
    language,
    category,
    description,
    owner,
    repositoryUrl,
    lastExecutedAt,
    executionCount,
    successRate,
    isEnabled,
    tags,
    createdAt,
    updatedAt,
    parameters,
  };
};

const normalizeSchedule = (value: Record<string, unknown>): AutomationSchedule => {
  const id = typeof value.id === 'string'
    ? value.id
    : typeof value.key === 'string'
      ? value.key
      : `schedule_${Math.random().toString(36).slice(2, 8)}`;
  const name = typeof value.name === 'string' ? value.name : '未命名排程';
  const scriptId = typeof value.script_id === 'string'
    ? value.script_id
    : typeof value.scriptId === 'string'
      ? value.scriptId
      : '';
  const scriptName = typeof value.script_name === 'string' ? value.script_name : undefined;
  const cronExpression = typeof value.cron_expression === 'string'
    ? value.cron_expression
    : typeof value.cron === 'string'
      ? value.cron
      : '* * * * *';
  const modeValue = typeof value.mode === 'string'
    ? value.mode
    : typeof value.schedule_mode === 'string'
      ? value.schedule_mode
      : 'advanced';
  const mode = ['simple', 'advanced'].includes(modeValue.toLowerCase())
    ? (modeValue.toLowerCase() as AutomationScheduleMode)
    : 'advanced';
  const frequency = typeof value.frequency === 'string' ? value.frequency : undefined;
  const timezone = typeof value.timezone === 'string' ? value.timezone : undefined;
  const isEnabled = value.enabled !== undefined ? Boolean(value.enabled) : undefined;
  const lastRunAt = typeof value.last_run === 'string'
    ? value.last_run
    : typeof value.lastRunAt === 'string'
      ? value.lastRunAt
      : undefined;
  const lastStatusRaw = typeof value.last_status === 'string'
    ? value.last_status
    : typeof value.lastStatus === 'string'
      ? value.lastStatus
      : undefined;
  const lastStatus = lastStatusRaw
    ? (lastStatusRaw.toLowerCase() as AutomationSchedule['lastStatus'])
    : undefined;
  const creator = typeof value.creator === 'string' ? value.creator : undefined;
  const nextRunAt = typeof value.next_run === 'string'
    ? value.next_run
    : typeof value.nextRunAt === 'string'
      ? value.nextRunAt
      : undefined;

  return {
    id,
    name,
    scriptId,
    scriptName,
    cronExpression,
    mode,
    frequency,
    timezone,
    isEnabled,
    lastRunAt,
    lastStatus,
    creator,
    nextRunAt,
  };
};

const parseDuration = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  const secondsMatch = trimmed.match(/([0-9]+(?:\.[0-9]+)?)s/);
  if (secondsMatch) {
    return Math.round(parseFloat(secondsMatch[1]) * 1000);
  }
  const msMatch = trimmed.match(/([0-9]+)ms/);
  if (msMatch) {
    return parseInt(msMatch[1], 10);
  }
  return undefined;
};

const normalizeExecution = (value: Record<string, unknown>): AutomationExecution => {
  const id = typeof value.id === 'string'
    ? value.id
    : typeof value.key === 'string'
      ? value.key
      : `run_${Math.random().toString(36).slice(2, 8)}`;
  const scriptId = typeof value.script_id === 'string'
    ? value.script_id
    : typeof value.scriptId === 'string'
      ? value.scriptId
      : '';
  const scriptName = typeof value.script_name === 'string'
    ? value.script_name
    : typeof value.scriptName === 'string'
      ? value.scriptName
      : undefined;
  const statusRaw = typeof value.status === 'string' ? value.status.toLowerCase() : 'success';
  const status: AutomationExecutionStatus = ['success', 'failed', 'running', 'cancelled'].includes(statusRaw)
    ? (statusRaw as AutomationExecutionStatus)
    : 'success';
  const trigger = value.trigger && typeof value.trigger === 'object'
    ? (value.trigger as Record<string, unknown>)
    : {};
  const triggerType = typeof trigger.type === 'string'
    ? trigger.type
    : typeof value.trigger_type === 'string'
      ? value.trigger_type
      : 'manual';
  const startedAt = typeof value.started_at === 'string'
    ? value.started_at
    : typeof value.start_time === 'string'
      ? value.start_time
      : undefined;
  const finishedAt = typeof value.finished_at === 'string'
    ? value.finished_at
    : typeof value.end_time === 'string'
      ? value.end_time
      : undefined;
  const durationMs = parseDuration(value.duration ?? value.duration_ms);
  const output = typeof value.output === 'string' ? value.output : undefined;
  const operator = typeof value.operator === 'string'
    ? value.operator
    : typeof trigger.user === 'string'
      ? trigger.user
      : undefined;

  return {
    id,
    scriptId,
    scriptName,
    status,
    triggerType,
    triggerMetadata: trigger,
    startedAt,
    finishedAt,
    durationMs,
    output,
    operator,
  };
};

const normalizeCollection = <T,>(values: unknown[], normalizer: (value: Record<string, unknown>) => T): T[] =>
  values
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => normalizer(item));

const fallbackScripts = normalizeCollection(fallbackScriptsRaw, normalizeScript);
const fallbackSchedules = normalizeCollection(fallbackSchedulesRaw, normalizeSchedule);
const fallbackExecutions = normalizeCollection(fallbackExecutionsRaw, normalizeExecution);

const computeStats = (
  scripts: AutomationScript[],
  schedules: AutomationSchedule[],
  executions: AutomationExecution[],
): AutomationStats => {
  const totalScripts = scripts.length;
  const activeScripts = scripts.filter((item) => item.isEnabled !== false).length;
  const scheduledJobs = schedules.filter((item) => item.isEnabled !== false).length;
  const windowStart = dayjs().subtract(24, 'hour');
  const runs24h = executions.filter((item) => item.startedAt && dayjs(item.startedAt).isAfter(windowStart));
  const success24h = runs24h.filter((item) => item.status === 'success').length;
  const successRate24h = runs24h.length ? Math.round((success24h / runs24h.length) * 100) : 0;
  const savedEngineerHours = runs24h.length ? Math.round(runs24h.length * 0.75) : Math.round(executions.length * 0.5);
  const trendingScripts = scripts.filter((item) => (item.executionCount ?? 0) >= 25).length;

  return {
    totalScripts,
    activeScripts,
    scheduledJobs,
    successRate24h,
    savedEngineerHours,
    trendingScripts,
  };
};

export const useAutomationCenter = () => {
  const [scripts, setScripts] = useState<AutomationScript[]>(fallbackScripts);
  const [schedules, setSchedules] = useState<AutomationSchedule[]>(fallbackSchedules);
  const [executions, setExecutions] = useState<AutomationExecution[]>(fallbackExecutions);
  const [stats, setStats] = useState<AutomationStats>(() => computeStats(fallbackScripts, fallbackSchedules, fallbackExecutions));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(true);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [scriptsResult, schedulesResult, executionsResult] = await Promise.allSettled([
        fetchJson<unknown>('scripts', { signal }),
        fetchJson<unknown>('schedules', { signal }),
        fetchJson<unknown>('automation-runs', { signal }),
      ]);

      let nextScripts = fallbackScripts;
      let nextSchedules = fallbackSchedules;
      let nextExecutions = fallbackExecutions;
      let usedFallback = false;

      if (scriptsResult.status === 'fulfilled') {
        const normalized = extractItems(scriptsResult.value, normalizeScript);
        if (normalized.length) {
          nextScripts = normalized;
        } else {
          usedFallback = true;
        }
      } else {
        usedFallback = true;
        const reason = scriptsResult.reason;
        setError(reason instanceof Error ? reason : new Error(String(reason ?? '未知錯誤')));
      }

      if (schedulesResult.status === 'fulfilled') {
        const normalized = extractItems(schedulesResult.value, normalizeSchedule);
        if (normalized.length) {
          nextSchedules = normalized;
        } else {
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      if (executionsResult.status === 'fulfilled') {
        const normalized = extractItems(executionsResult.value, normalizeExecution);
        if (normalized.length) {
          nextExecutions = normalized;
        } else {
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      setScripts(nextScripts);
      setSchedules(nextSchedules);
      setExecutions(nextExecutions);
      setStats(computeStats(nextScripts, nextSchedules, nextExecutions));
      if (!usedFallback) {
        setError(null);
      }
      setIsFallback(usedFallback);
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') {
        return;
      }
      setScripts(fallbackScripts);
      setSchedules(fallbackSchedules);
      setExecutions(fallbackExecutions);
      setStats(computeStats(fallbackScripts, fallbackSchedules, fallbackExecutions));
      setIsFallback(true);
      setError(err instanceof Error ? err : new Error(String(err ?? '未知錯誤')));
    } finally {
      setLoading(false);
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

  const scriptCategories = useMemo(() => {
    const categories = new Set<string>();
    scripts.forEach((script) => {
      if (script.category) {
        categories.add(script.category);
      }
    });
    return Array.from(categories);
  }, [scripts]);

  return {
    scripts,
    schedules,
    executions,
    stats,
    loading,
    error,
    isFallback,
    scriptCategories,
    refresh,
  } as const;
};

const extractItems = <T,>(payload: unknown, normalizer: (value: Record<string, unknown>) => T): T[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const container = payload as Record<string, unknown>;
  const candidates = Array.isArray(container.items)
    ? container.items
    : Array.isArray(container.data)
      ? container.data
      : Array.isArray(container.results)
        ? container.results
        : Array.isArray(payload)
          ? (payload as unknown[])
          : [];
  if (!Array.isArray(candidates) || !candidates.length) {
    return [];
  }
  return normalizeCollection(candidates, normalizer);
};

export default useAutomationCenter;
