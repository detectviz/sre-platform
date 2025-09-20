import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react';
import {
  App as AntdApp,
  Alert,
  Button,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  LinkOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  ScheduleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { ContextualKPICard, CreateSilenceModal, DataTable, GlassModal, PageHeader, StatusBadge } from '../components';
import useIncidents from '../hooks/useIncidents';
import { useUsers } from '../hooks/useUsers';
import { fetchJson } from '../utils/apiClient';

import type { StatusBadgeProps } from '../components/StatusBadge';
import type { ContextualKPICardProps } from '../components/ContextualKPICard';

const { Text } = Typography;
const { Search } = Input;

dayjs.extend(relativeTime);

type IncidentRecord = {
  id: string;
  summary: string;
  severity?: string;
  status?: string;
  created_at?: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  assignee?: string | null;
  assigneeName?: string | null;
  resource_name?: string | null;
  service?: string | null;
  business_impact?: string | null;
  rule_id?: string | null;
  ruleName?: string | null;
  automation_id?: string | null;
  labels?: Record<string, string> | null;
  annotations?: Record<string, string> | null;
  triggerThreshold?: string | null;
  source?: string | null;
  storm_group?: string | null;
};

type UserRecord = {
  id?: string;
  key?: string;
  name?: string;
  email?: string;
};

type IncidentRuleRecord = {
  id: string;
  name: string;
  description?: string;
  severity: string;
  status: 'active' | 'paused' | 'draft';
  conditions: string[];
  actions?: string[];
  lastUpdated?: string;
  owner?: string;
};

type SilenceRuleRecord = {
  id: string;
  name: string;
  scope: string;
  status: 'active' | 'expired' | 'scheduled';
  schedule: string;
  createdBy?: string;
  tags?: string[];
  nextExecution?: string;
};

type IncidentRuleFormValues = {
  name: string;
  description?: string;
  severity: string;
  status: IncidentRuleRecord['status'];
  owner?: string;
  conditionsText: string;
  actionsText?: string;
};

type SilenceRuleFormValues = {
  name: string;
  scope: string;
  status: SilenceRuleRecord['status'];
  schedule: string;
  createdBy?: string;
  tagsText?: string;
  nextExecution?: string;
};

type AIAnalysisResult = {
  summary: string;
  probableCauses: string[];
  recommendedActions: string[];
  impact: string;
  confidence: number;
  relatedSignals?: string[];
};

const severityToneMap: Record<string, StatusBadgeProps['tone']> = {
  critical: 'danger',
  high: 'danger',
  major: 'danger',
  error: 'danger',
  warning: 'warning',
  elevated: 'warning',
  medium: 'warning',
  moderate: 'warning',
  low: 'info',
  minor: 'info',
  info: 'info',
  informational: 'info',
};

const severityLabelMap: Record<string, string> = {
  critical: 'P0 重大',
  high: '高風險',
  major: '重大',
  medium: '中等',
  warning: '警示',
  low: '低風險',
  minor: '輕微',
  info: '資訊',
};

const statusToneMap: Record<string, StatusBadgeProps['tone']> = {
  new: 'danger',
  acknowledged: 'warning',
  investigating: 'warning',
  in_progress: 'warning',
  escalated: 'warning',
  resolved: 'success',
  closed: 'success',
  silenced: 'info',
  suppressed: 'info',
};

const statusLabelMap: Record<string, string> = {
  new: '新事件',
  acknowledged: '已確認',
  investigating: '調查中',
  in_progress: '處理中',
  escalated: '已升級',
  resolved: '已解決',
  closed: '已關閉',
  silenced: '已靜音',
  suppressed: '已抑制',
};

const incidentRuleStatusToneMap: Record<IncidentRuleRecord['status'], StatusBadgeProps['tone']> = {
  active: 'success',
  paused: 'warning',
  draft: 'info',
};

const incidentRuleStatusLabelMap: Record<IncidentRuleRecord['status'], string> = {
  active: '啟用',
  paused: '暫停',
  draft: '草稿',
};

const silenceStatusToneMap: Record<SilenceRuleRecord['status'], StatusBadgeProps['tone']> = {
  active: 'info',
  expired: 'neutral',
  scheduled: 'warning',
};

const silenceStatusLabelMap: Record<SilenceRuleRecord['status'], string> = {
  active: '進行中',
  expired: '已結束',
  scheduled: '已排程',
};

const impactToneMap: Record<string, StatusBadgeProps['tone']> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY/MM/DD HH:mm') : '—';
};

const formatRelative = (value?: string | null) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.fromNow() : '—';
};

const normalizeId = (raw: { id?: string; key?: string; summary?: string; created_at?: string; rule_id?: string | null; resource_name?: string | null }) => {
  if (raw.id) return String(raw.id);
  if (raw.key) return String(raw.key);
  if (raw.rule_id) return String(raw.rule_id);
  if (raw.summary && raw.created_at) return `${raw.summary}-${raw.created_at}`;
  if (raw.summary) return raw.summary;
  if (raw.created_at) return `incident-${raw.created_at}`;
  if (raw.resource_name) return `incident-${raw.resource_name}`;
  return 'incident-unknown';
};

const getStatusLabel = (status?: string) => {
  if (!status) return '未知';
  const normalized = status.toLowerCase();
  return statusLabelMap[normalized] ?? normalized.toUpperCase();
};

const getSeverityLabel = (severity?: string) => {
  if (!severity) return '未定義';
  const normalized = severity.toLowerCase();
  return severityLabelMap[normalized] ?? normalized.toUpperCase();
};

const fallbackIncidentRules: IncidentRuleRecord[] = [
  {
    id: 'rule-1',
    name: '資料庫 CPU 告警',
    description: '當任何 production 資料庫 CPU 超過 85% 觸發告警',
    severity: 'critical',
    status: 'active',
    conditions: ['resource.type = database', 'cpu.usage > 85%', 'env = production'],
    actions: ['通知: 資料庫值班', '自動化: 擴容腳本'],
    lastUpdated: '2025-09-17T10:00:00Z',
    owner: 'Database SRE Team',
  },
  {
    id: 'rule-2',
    name: 'Web 前端錯誤率',
    severity: 'warning',
    status: 'paused',
    conditions: ['service = web-frontend', 'error_rate > 3%', 'window = 5m'],
    actions: ['通知: Web Oncall'],
    lastUpdated: '2025-09-18T01:00:00Z',
    owner: 'Web Platform Team',
  },
  {
    id: 'rule-3',
    name: 'APM 基礎延遲告警',
    severity: 'medium',
    status: 'draft',
    conditions: ['apm.latency.p95 > 2000ms', 'env = staging'],
    actions: ['通知: QA Oncall'],
    lastUpdated: '2025-09-15T14:30:00Z',
    owner: 'Performance Guild',
  },
];

const fallbackSilenceRules: SilenceRuleRecord[] = [
  {
    id: 'silence-1',
    name: '資料庫夜間維護',
    scope: 'resource.type = database AND env = production',
    status: 'scheduled',
    schedule: '每週二 01:00 ~ 03:00',
    createdBy: 'Admin User',
    tags: ['db', 'maintenance'],
    nextExecution: '2025-09-23T01:00:00Z',
  },
  {
    id: 'silence-2',
    name: 'Webhook Storm 緊急靜音',
    scope: 'service = webhook-gateway',
    status: 'active',
    schedule: '立即生效，持續 4 小時',
    createdBy: 'Ops Oncall',
    tags: ['hotfix'],
    nextExecution: '2025-09-18T06:10:00Z',
  },
  {
    id: 'silence-3',
    name: 'Staging 預設靜音',
    scope: 'env = staging',
    status: 'expired',
    schedule: '2025-09-10 20:00 ~ 2025-09-11 06:00',
    createdBy: 'QA Lead',
    tags: ['staging'],
  },
];

const mapSilenceRuleFromApi = (rule: Record<string, unknown>): SilenceRuleRecord => {
  const matchers = Array.isArray(rule.matchers)
    ? (rule.matchers as Array<{ name?: string; value?: string }>)
    : [];
  const scopeFromMatchers = matchers
    .map((matcher) =>
      matcher?.name && matcher?.value
        ? `${matcher.name} = ${String(matcher.value)}`
        : '',
    )
    .filter(Boolean)
    .join(' AND ');

  const status: SilenceRuleRecord['status'] = rule.deleted_at ? 'expired' : rule.is_enabled === false ? 'expired' : 'active';

  const scheduleParts: string[] = [];
  if (typeof rule.cron_expression === 'string' && rule.cron_expression) {
    scheduleParts.push(`Cron: ${rule.cron_expression}`);
  }
  if (typeof rule.duration_minutes === 'number') {
    scheduleParts.push(`持續 ${rule.duration_minutes} 分鐘`);
  }
  if (typeof rule.timezone === 'string' && rule.timezone) {
    scheduleParts.push(`時區 ${rule.timezone}`);
  }

  return {
    id: String(rule.id ?? `silence-${Date.now()}`),
    name: String(rule.name ?? '未命名靜音'),
    scope: scopeFromMatchers || String(rule.scope ?? '—'),
    status,
    schedule: scheduleParts.length ? scheduleParts.join(' · ') : String(rule.schedule ?? '—'),
    createdBy: typeof rule.creator_id === 'string' ? rule.creator_id : rule.createdBy ? String(rule.createdBy) : undefined,
    tags: Array.isArray(rule.tags)
      ? (rule.tags as Array<string>)
      : matchers.map((matcher) => matcher?.name).filter(Boolean) as string[],
    nextExecution: typeof rule.next_execution === 'string' ? rule.next_execution : undefined,
  };
};

const generateFallbackAIAnalysis = (incident: IncidentRecord): AIAnalysisResult => {
  const severityLabel = getSeverityLabel(incident.severity);
  const service = incident.service ?? '目標服務';
  const resource = incident.resource_name ?? '相關資源';

  return {
    summary: `AI 判斷 ${service} 目前受到 ${severityLabel} 等級影響，建議優先排查 ${resource} 的指標波動。`,
    probableCauses: [
      `${resource} 的 CPU/記憶體使用率在 30 分鐘內急速攀升，可能導致資源飽和。`,
      `${service} 最近部署版本與此事件時間重疊，需確認版本變更。`,
      '上游依賴服務回應時間增加，造成連鎖告警。',
    ],
    recommendedActions: [
      '檢查相關儀表板中的資源使用趨勢，確認是否需擴容。',
      '比對最近部署或設定變更，必要時回滾。',
      '啟動自動化腳本或 Runbook，確保服務降噪。',
    ],
    impact: incident.business_impact ? `業務影響評估：${incident.business_impact}` : '業務影響評估：需進一步確認。',
    confidence: 78,
    relatedSignals: [
      '延遲指標 (p95)',
      'CPU 使用率',
      '自動化執行歷史',
    ],
  };
};

type IncidentsPageProps = {
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
  pageKey?: string;
};

const IncidentsPage = ({ onNavigate, pageKey }: IncidentsPageProps) => {
  const { message, modal } = AntdApp.useApp();
  const incidentTabKey = pageKey === 'alerting-rules' || pageKey === 'silences' ? pageKey : pageKey === 'incidents' ? 'incident-list' : pageKey ?? 'incident-list';
  const availableTabs: Array<'incident-list' | 'alerting-rules' | 'silences'> = ['incident-list', 'alerting-rules', 'silences'];
  const [activeTab, setActiveTab] = useState(availableTabs.includes(incidentTabKey as typeof availableTabs[number]) ? (incidentTabKey as typeof availableTabs[number]) : 'incident-list');
  const { incidents, loading: incidentsLoading, error: incidentsError, refetch } = useIncidents();
  const { users, loading: usersLoading } = useUsers();

  const usersMap = useMemo(() => {
    const map = new Map<string, UserRecord>();
    if (Array.isArray(users)) {
      (users as UserRecord[]).forEach((user) => {
        const id = user.id ?? user.key ?? user.email;
        if (id) {
          map.set(String(id), user);
        }
      });
    }
    return map;
  }, [users]);

  const normalizedIncidents = useMemo<IncidentRecord[]>(() => {
    if (!Array.isArray(incidents)) return [];

    return (incidents as (Partial<IncidentRecord> & { key?: string })[]).map((raw) => {
      const id = normalizeId(raw);
      const severity = typeof raw.severity === 'string' ? raw.severity.toLowerCase() : undefined;
      const status = typeof raw.status === 'string' ? raw.status.toLowerCase() : undefined;
      const assigneeId = typeof raw.assignee === 'string' ? raw.assignee : null;
      const assignedUser = assigneeId ? usersMap.get(assigneeId) : undefined;

      return {
        id,
        summary: raw.summary ?? '未命名事件',
        severity,
        status,
        created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
        acknowledged_at: typeof raw.acknowledged_at === 'string' ? raw.acknowledged_at : null,
        resolved_at: typeof raw.resolved_at === 'string' ? raw.resolved_at : null,
        assignee: assigneeId,
        assigneeName: assignedUser?.name ?? assignedUser?.email ?? assigneeId ?? null,
        resource_name: raw.resource_name ?? null,
        service: raw.service ?? null,
        business_impact: raw.business_impact ?? null,
        rule_id: raw.rule_id ?? null,
        ruleName: raw.ruleName ?? null,
        automation_id: raw.automation_id ?? null,
        labels: raw.labels ?? null,
        annotations: raw.annotations ?? null,
        triggerThreshold: raw.triggerThreshold ?? null,
        source: raw.source ?? null,
        storm_group: raw.storm_group ?? null,
      } satisfies IncidentRecord;
    });
  }, [incidents, usersMap]);

  const [overrides, setOverrides] = useState<Record<string, Partial<IncidentRecord>>>({});
  const incidentsWithOverrides = useMemo<IncidentRecord[]>(
    () => normalizedIncidents.map((incident) => ({ ...incident, ...(overrides[incident.id] ?? {}) })),
    [normalizedIncidents, overrides],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [silenceModalOpen, setSilenceModalOpen] = useState(false);
  const [silenceIncidentId, setSilenceIncidentId] = useState<string | null>(null);
  const [silenceRules, setSilenceRules] = useState<SilenceRuleRecord[]>([]);
  const [silenceSearchText, setSilenceSearchText] = useState('');
  const [silenceStatusFilter, setSilenceStatusFilter] = useState<'all' | SilenceRuleRecord['status']>('all');
  const [silenceRuleModalOpen, setSilenceRuleModalOpen] = useState(false);
  const [editingSilenceRule, setEditingSilenceRule] = useState<SilenceRuleRecord | null>(null);
  const [silenceRuleForm] = Form.useForm<SilenceRuleFormValues>();
  const [silenceRulesLoading, setSilenceRulesLoading] = useState(false);
  const [silenceRulesError, setSilenceRulesError] = useState<string | null>(null);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<IncidentRecord | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [incidentRules, setIncidentRules] = useState<IncidentRuleRecord[]>([]);
  const [incidentRulesLoading, setIncidentRulesLoading] = useState(false);
  const [incidentRulesError, setIncidentRulesError] = useState<string | null>(null);
  const [ruleSearchText, setRuleSearchText] = useState('');
  const [ruleSeverityFilter, setRuleSeverityFilter] = useState('all');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<'all' | IncidentRuleRecord['status']>('all');
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IncidentRuleRecord | null>(null);
  const [ruleForm] = Form.useForm<IncidentRuleFormValues>();

  useEffect(() => {
    const controller = new AbortController();

    const loadIncidentRules = async () => {
      try {
        setIncidentRulesLoading(true);
        setIncidentRulesError(null);
        const payload: any = await fetchJson('incident-rules?page_size=200', { signal: controller.signal });
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];
        const normalized = items.map((item: Record<string, unknown>) => ({
          id: String(item.id ?? `rule-${Date.now()}`),
          name: String(item.name ?? '未命名規則'),
          description: item.description ? String(item.description) : undefined,
          severity: String(item.severity ?? 'info').toLowerCase(),
          status: (item.status as IncidentRuleRecord['status']) ?? 'draft',
          conditions: Array.isArray(item.conditions)
            ? (item.conditions as string[])
            : typeof item.conditions === 'string'
              ? item.conditions.split('\n').map((line) => line.trim()).filter(Boolean)
              : [],
          actions: Array.isArray(item.actions)
            ? (item.actions as string[])
            : typeof item.actions === 'string'
              ? item.actions.split('\n').map((line) => line.trim()).filter(Boolean)
              : undefined,
          lastUpdated: item.last_updated ? String(item.last_updated) : undefined,
          owner: item.owner ? String(item.owner) : undefined,
        }));
        setIncidentRules(normalized.length ? normalized : fallbackIncidentRules);
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          console.warn('[IncidentsPage] 使用事件規則 fallback 資料', err);
          setIncidentRules(fallbackIncidentRules);
          setIncidentRulesError(err instanceof Error ? err.message : '載入事件規則失敗');
        }
      } finally {
        setIncidentRulesLoading(false);
      }
    };

    const loadSilenceRules = async () => {
      try {
        setSilenceRulesLoading(true);
        setSilenceRulesError(null);
        const payload: any = await fetchJson('recurring-silence-rules?page_size=200', { signal: controller.signal });
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];
        const normalized = items.map((item: Record<string, unknown>) => mapSilenceRuleFromApi(item));
        setSilenceRules(normalized.length ? normalized : fallbackSilenceRules);
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          console.warn('[IncidentsPage] 使用靜音規則 fallback 資料', err);
          setSilenceRules(fallbackSilenceRules);
          setSilenceRulesError(err instanceof Error ? err.message : '載入靜音規則失敗');
        }
      } finally {
        setSilenceRulesLoading(false);
      }
    };

    loadIncidentRules();
    loadSilenceRules();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeTab === 'incident-list') {
      setStatusFilter((prev) => (prev === 'all' ? 'open' : prev));
    }
  }, [activeTab]);

  const currentIncident = useMemo(
    () => incidentsWithOverrides.find((incident) => incident.id === activeIncidentId) ?? null,
    [incidentsWithOverrides, activeIncidentId],
  );


  const severityOptions = useMemo(() => {
    const set = new Set<string>();
    incidentsWithOverrides.forEach((incident) => {
      if (incident.severity) {
        set.add(incident.severity);
      }
    });

    const dynamic = Array.from(set)
      .sort()
      .map((severity) => ({
        value: severity,
        label: getSeverityLabel(severity),
      }));

    return [{ value: 'all', label: '全部嚴重性' }, ...dynamic];
  }, [incidentsWithOverrides]);

  const statusValues = useMemo(() => {
    const set = new Set<string>();
    incidentsWithOverrides.forEach((incident) => {
      if (incident.status) {
        set.add(incident.status);
      }
    });
    return Array.from(set).sort();
  }, [incidentsWithOverrides]);

  const statusOptions = useMemo(() => {
    const base = [
      { value: 'all', label: '全部狀態' },
      { value: 'open', label: '僅顯示活躍' },
      { value: 'acknowledged', label: getStatusLabel('acknowledged') },
      { value: 'resolved', label: getStatusLabel('resolved') },
      { value: 'silenced', label: getStatusLabel('silenced') },
      { value: 'automated', label: '自動化處理' },
    ];
    const known = new Set(base.map((item) => item.value));

    statusValues.forEach((status) => {
      if (!known.has(status)) {
        base.push({ value: status, label: getStatusLabel(status) });
      }
    });

    return base;
  }, [statusValues]);

  const filteredIncidents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return incidentsWithOverrides
      .filter((incident) => {
        const matchesKeyword =
          !keyword ||
          [incident.summary, incident.resource_name, incident.service, incident.ruleName]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));

        const matchesSeverity =
          severityFilter === 'all' || (incident.severity?.toLowerCase() ?? '') === severityFilter;

        const status = incident.status?.toLowerCase() ?? '';
        const matchesStatus = (() => {
          if (statusFilter === 'all') return true;
          if (statusFilter === 'open') {
            return status && !['resolved', 'closed', 'silenced', 'suppressed'].includes(status);
          }
          if (statusFilter === 'automated') {
            return Boolean(incident.automation_id);
          }
          return status === statusFilter;
        })();

        return matchesKeyword && matchesSeverity && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = a.created_at ? dayjs(a.created_at).valueOf() : 0;
        const timeB = b.created_at ? dayjs(b.created_at).valueOf() : 0;
        return timeB - timeA;
      });
  }, [incidentsWithOverrides, searchTerm, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    const now = dayjs();
    let active = 0;
    let resolvedToday = 0;
    let acknowledged = 0;
    let automationCount = 0;
    let critical = 0;
    const resolutionDurations: number[] = [];

    incidentsWithOverrides.forEach((incident) => {
      const status = incident.status ?? '';
      if (!['resolved', 'closed'].includes(status)) {
        active += 1;
      }
      if (status === 'acknowledged') {
        acknowledged += 1;
      }
      if (status === 'resolved' && incident.resolved_at && dayjs(incident.resolved_at).isSame(now, 'day')) {
        resolvedToday += 1;
      }
      if (incident.automation_id) {
        automationCount += 1;
      }
      if (incident.severity && ['critical', 'high', 'major'].includes(incident.severity)) {
        critical += 1;
      }
      if (incident.resolved_at && incident.created_at) {
        const createdAt = dayjs(incident.created_at);
        const resolvedAt = dayjs(incident.resolved_at);
        if (createdAt.isValid() && resolvedAt.isValid() && resolvedAt.isAfter(createdAt)) {
          const diffHours = resolvedAt.diff(createdAt, 'minute') / 60;
          if (Number.isFinite(diffHours)) {
            resolutionDurations.push(Number(diffHours.toFixed(2)));
          }
        }
      }
    });

    const avgResolution = resolutionDurations.length
      ? Number(
        (
          resolutionDurations.reduce((sum, value) => sum + value, 0) /
          resolutionDurations.length
        ).toFixed(1),
      )
      : null;

    const automationRate = incidentsWithOverrides.length
      ? Number(((automationCount / incidentsWithOverrides.length) * 100).toFixed(1))
      : 0;

    return {
      active,
      acknowledged,
      resolvedToday,
      avgResolution,
      automationRate,
      critical,
    };
  }, [incidentsWithOverrides]);

  const ruleSeverityOptions = useMemo(() => {
    const set = new Set<string>();
    incidentRules.forEach((rule) => set.add(rule.severity.toLowerCase()));
    return [{ value: 'all', label: '全部嚴重性' }, ...Array.from(set).map((severity) => ({ value: severity, label: getSeverityLabel(severity) }))];
  }, [incidentRules]);

  const ruleStatusOptions = useMemo(() => [
    { value: 'all', label: '全部狀態' },
    { value: 'active', label: incidentRuleStatusLabelMap.active },
    { value: 'paused', label: incidentRuleStatusLabelMap.paused },
    { value: 'draft', label: incidentRuleStatusLabelMap.draft },
  ], []);

  const filteredIncidentRules = useMemo(() => {
    const keyword = ruleSearchText.trim().toLowerCase();
    return incidentRules.filter((rule) => {
      const matchesSearch =
        !keyword ||
        [rule.name, rule.description, rule.owner]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesSeverity = ruleSeverityFilter === 'all' || rule.severity.toLowerCase() === ruleSeverityFilter;
      const matchesStatus = ruleStatusFilter === 'all' || rule.status === ruleStatusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidentRules, ruleSearchText, ruleSeverityFilter, ruleStatusFilter]);

  const handleRuleModalOpen = useCallback(
    (rule?: IncidentRuleRecord) => {
      if (rule) {
        setEditingRule(rule);
        ruleForm.setFieldsValue({
          name: rule.name,
          description: rule.description,
          severity: rule.severity,
          status: rule.status,
          owner: rule.owner,
          conditionsText: rule.conditions.join('\n'),
          actionsText: (rule.actions ?? []).join('\n'),
        });
      } else {
        setEditingRule(null);
        ruleForm.resetFields();
        ruleForm.setFieldsValue({ severity: 'warning', status: 'active' });
      }
      setRuleModalOpen(true);
    },
    [ruleForm],
  );

  const handleRuleModalClose = useCallback(() => {
    setRuleModalOpen(false);
    setEditingRule(null);
    ruleForm.resetFields();
  }, [ruleForm]);

  const handleRuleSubmit = useCallback(async () => {
    try {
      const values = await ruleForm.validateFields();
      const formValues = values as IncidentRuleFormValues;
      const conditions = formValues.conditionsText
        ?.split('\n')
        .map((line) => line.trim())
        .filter(Boolean) ?? [];
      const actions = formValues.actionsText
        ?.split('\n')
        .map((line) => line.trim())
        .filter(Boolean) ?? [];

      const normalizedSeverity = formValues.severity.toLowerCase();
      const baseRule: IncidentRuleRecord = {
        id: editingRule?.id ?? `rule-${Date.now()}`,
        name: formValues.name,
        description: formValues.description?.trim(),
        severity: normalizedSeverity,
        status: formValues.status,
        conditions,
        actions: actions.length ? actions : undefined,
        lastUpdated: new Date().toISOString(),
        owner: formValues.owner?.trim(),
      };

      setIncidentRules((prev) => {
        if (editingRule) {
          return prev.map((rule) => (rule.id === editingRule.id ? baseRule : rule));
        }
        return [baseRule, ...prev];
      });

      handleRuleModalClose();
      message.success(editingRule ? '事件規則已更新' : '事件規則已新增');
    } catch {
      // validation errors handled by form
    }
  }, [editingRule, handleRuleModalClose, message, ruleForm]);

  const handleRuleStatusToggle = useCallback(
    (record: IncidentRuleRecord) => {
      setIncidentRules((prev) =>
        prev.map((rule) =>
          rule.id === record.id
            ? {
              ...rule,
              status: rule.status === 'active' ? 'paused' : 'active',
              lastUpdated: new Date().toISOString(),
            }
            : rule,
        ),
      );
      message.success(record.status === 'active' ? '規則已暫停' : '規則已啟用');
    },
    [message],
  );

  const handleDeleteRule = useCallback(
    (record: IncidentRuleRecord) => {
      modal.confirm({
        title: `刪除事件規則「${record.name}」`,
        content: '刪除後將無法自動觸發此規則，確認要繼續嗎？',
        okText: '刪除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: () => {
          setIncidentRules((prev) => prev.filter((rule) => rule.id !== record.id));
          message.success('事件規則已刪除');
        },
      });
    },
    [message, modal],
  );

  const ruleColumns: ColumnsType<IncidentRuleRecord> = useMemo(
    () => [
      {
        title: '規則名稱',
        dataIndex: 'name',
        render: (_: string, record) => (
          <Space direction="vertical" size={2}>
            <Text strong>{record.name}</Text>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: '嚴重性',
        dataIndex: 'severity',
        width: 120,
        render: (severity: string) => (
          <StatusBadge
            label={getSeverityLabel(severity)}
            tone={severityToneMap[severity?.toLowerCase() ?? ''] ?? 'neutral'}
          />
        ),
      },
      {
        title: '狀態',
        dataIndex: 'status',
        width: 120,
        render: (status: IncidentRuleRecord['status']) => (
          <StatusBadge label={incidentRuleStatusLabelMap[status]} tone={incidentRuleStatusToneMap[status]} />
        ),
      },
      {
        title: '條件',
        dataIndex: 'conditions',
        render: (_: string, record) => (
          <Space direction="vertical" size={4}>
            {record.conditions.slice(0, 2).map((condition, index) => (
              <Text type="secondary" key={`cond-${record.id}-${index}`} style={{ fontSize: 12 }}>
                • {condition}
              </Text>
            ))}
            {record.conditions.length > 2 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                及其他 {record.conditions.length - 2} 項條件
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: '最後更新',
        dataIndex: 'lastUpdated',
        width: 180,
        render: (value?: string) => (
          <Space direction="vertical" size={0}>
            <Text>{formatDateTime(value)}</Text>
            <Text type="secondary">{formatRelative(value)}</Text>
          </Space>
        ),
      },
      {
        title: '負責團隊',
        dataIndex: 'owner',
        width: 180,
        render: (owner?: string) => owner ?? <Text type="secondary">未指定</Text>,
      },
      {
        title: '操作',
        key: 'actions',
        width: 220,
        render: (_: unknown, record) => (
          <Space size={8}>
            <Button type="link" onClick={() => handleRuleModalOpen(record)}>
              編輯
            </Button>
            <Button type="link" onClick={() => handleRuleStatusToggle(record)}>
              {record.status === 'active' ? '暫停' : '啟用'}
            </Button>
            <Button type="link" danger onClick={() => handleDeleteRule(record)}>
              刪除
            </Button>
          </Space>
        ),
      },
    ],
    [handleDeleteRule, handleRuleModalOpen, handleRuleStatusToggle],
  );

  const renderAlertingRules = () => {
    const toolbar = (
      <Row justify="space-between" align="middle" gutter={[16, 12]}>
        <Col flex="auto">
          <Space wrap size={12}>
            <Search
              allowClear
              placeholder="搜尋規則名稱、描述或負責人"
              value={ruleSearchText}
              onChange={(event) => setRuleSearchText(event.target.value)}
              style={{ minWidth: 220 }}
            />
            <Select
              value={ruleSeverityFilter}
              options={ruleSeverityOptions}
              onChange={(value) => setRuleSeverityFilter(value)}
              style={{ width: 160 }}
            />
            <Select
              value={ruleStatusFilter}
              options={ruleStatusOptions}
              onChange={(value) => setRuleStatusFilter(value as typeof ruleStatusFilter)}
              style={{ width: 160 }}
            />
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleRuleModalOpen()}>
            新增規則
          </Button>
        </Col>
      </Row>
    );

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {incidentRulesError && (
          <Alert type="error" showIcon message="無法載入事件規則" description={incidentRulesError} />
        )}
        {incidentRulesLoading ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Spin tip="正在載入事件規則..." />
          </div>
        ) : (
          <DataTable<IncidentRuleRecord>
            dataSource={filteredIncidentRules}
            columns={ruleColumns}
            rowKey={(record) => record.id}
            titleContent={toolbar}
            locale={{
              emptyText: <Empty description={incidentRules.length ? '查無符合條件的規則' : '尚未建立事件規則'} />,
            }}
          />
        )}
      </Space>
    );
  };

  const silenceStatusOptions = useMemo(() => [
    { value: 'all', label: '全部狀態' },
    { value: 'active', label: silenceStatusLabelMap.active },
    { value: 'scheduled', label: silenceStatusLabelMap.scheduled },
    { value: 'expired', label: silenceStatusLabelMap.expired },
  ], []);

  const filteredSilenceRules = useMemo(() => {
    const keyword = silenceSearchText.trim().toLowerCase();
    return silenceRules.filter((rule) => {
      const matchesKeyword =
        !keyword ||
        [rule.name, rule.scope, rule.createdBy]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesStatus = silenceStatusFilter === 'all' || rule.status === silenceStatusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [silenceRules, silenceSearchText, silenceStatusFilter]);

  const handleSilenceRuleModalOpen = useCallback(
    (rule?: SilenceRuleRecord) => {
      if (rule) {
        setEditingSilenceRule(rule);
        silenceRuleForm.setFieldsValue({
          name: rule.name,
          scope: rule.scope,
          status: rule.status,
          schedule: rule.schedule,
          createdBy: rule.createdBy,
          nextExecution: rule.nextExecution,
          tagsText: (rule.tags ?? []).join('\n'),
        });
      } else {
        setEditingSilenceRule(null);
        silenceRuleForm.resetFields();
        silenceRuleForm.setFieldsValue({ status: 'active' });
      }
      setSilenceRuleModalOpen(true);
    },
    [silenceRuleForm],
  );

  const handleSilenceRuleModalClose = useCallback(() => {
    setSilenceRuleModalOpen(false);
    setEditingSilenceRule(null);
    silenceRuleForm.resetFields();
  }, [silenceRuleForm]);

  const handleSilenceRuleSubmit = useCallback(async () => {
    try {
      const values = await silenceRuleForm.validateFields();
      const formValues = values as SilenceRuleFormValues;
      const tags = formValues.tagsText
        ?.split(/\n|,/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const nextRule: SilenceRuleRecord = {
        id: editingSilenceRule?.id ?? `silence-${Date.now()}`,
        name: formValues.name,
        scope: formValues.scope,
        status: formValues.status,
        schedule: formValues.schedule,
        createdBy: formValues.createdBy?.trim(),
        tags: tags && tags.length ? tags : undefined,
        nextExecution: formValues.nextExecution,
      };

      setSilenceRules((prev) => {
        if (editingSilenceRule) {
          return prev.map((rule) => (rule.id === editingSilenceRule.id ? nextRule : rule));
        }
        return [nextRule, ...prev];
      });

      handleSilenceRuleModalClose();
      message.success(editingSilenceRule ? '靜音規則已更新' : '靜音規則已新增');
    } catch {
      // validation errors handled by form
    }
  }, [editingSilenceRule, handleSilenceRuleModalClose, message, silenceRuleForm, setSilenceRules]);

  const handleDeleteSilenceRule = useCallback(
    (record: SilenceRuleRecord) => {
      modal.confirm({
        title: `刪除靜音規則「${record.name}」`,
        content: '刪除後將停止靜音對應範圍，確認要刪除嗎？',
        okText: '刪除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: () => {
          setSilenceRules((prev) => prev.filter((rule) => rule.id !== record.id));
          message.success('靜音規則已刪除');
        },
      });
    },
    [message, modal, setSilenceRules],
  );

  const silenceColumns: ColumnsType<SilenceRuleRecord> = useMemo(
    () => [
      {
        title: '靜音名稱',
        dataIndex: 'name',
        render: (_: string, record) => (
          <Space direction="vertical" size={2}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.scope}
            </Text>
          </Space>
        ),
      },
      {
        title: '狀態',
        dataIndex: 'status',
        width: 120,
        render: (status: SilenceRuleRecord['status']) => (
          <StatusBadge label={silenceStatusLabelMap[status]} tone={silenceStatusToneMap[status]} />
        ),
      },
      {
        title: '排程',
        dataIndex: 'schedule',
        render: (schedule: string) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {schedule}
          </Text>
        ),
      },
      {
        title: '下次生效',
        dataIndex: 'nextExecution',
        width: 200,
        render: (value?: string) => (
          value ? (
            <Space direction="vertical" size={0}>
              <Text>{formatDateTime(value)}</Text>
              <Text type="secondary">{formatRelative(value)}</Text>
            </Space>
          ) : (
            <Text type="secondary">—</Text>
          )
        ),
      },
      {
        title: '建立者',
        dataIndex: 'createdBy',
        width: 160,
        render: (createdBy?: string) => createdBy ?? <Text type="secondary">未指定</Text>,
      },
      {
        title: '標籤',
        dataIndex: 'tags',
        render: (tags?: string[]) =>
          tags && tags.length ? (
            <Space size={4} wrap>
              {tags.map((tag) => (
                <Tag key={`${tag}-tag`} color="geekblue">
                  {tag}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 200,
        render: (_: unknown, record) => (
          <Space size={8}>
            <Button type="link" onClick={() => handleSilenceRuleModalOpen(record)}>
              編輯
            </Button>
            <Button type="link" danger onClick={() => handleDeleteSilenceRule(record)}>
              刪除
            </Button>
          </Space>
        ),
      },
    ],
    [handleDeleteSilenceRule, handleSilenceRuleModalOpen],
  );

  const handleOpenAIAnalysis = useCallback(
    (incident: IncidentRecord) => {
      setAnalysisTarget(incident);
      setAiAnalysisModalOpen(true);
      setAnalysisLoading(true);
      setTimeout(() => {
        setAnalysisResult(generateFallbackAIAnalysis(incident));
        setAnalysisLoading(false);
      }, 350);
    },
    [],
  );

  const handleCloseAIAnalysis = useCallback(() => {
    setAiAnalysisModalOpen(false);
    setAnalysisTarget(null);
    setAnalysisResult(null);
    setAnalysisLoading(false);
  }, []);

  const renderSilenceRules = () => {
    const toolbar = (
      <Row justify="space-between" align="middle" gutter={[16, 12]}>
        <Col flex="auto">
          <Space wrap size={12}>
            <Search
              allowClear
              placeholder="搜尋靜音名稱、範圍或建立者"
              value={silenceSearchText}
              onChange={(event) => setSilenceSearchText(event.target.value)}
              style={{ minWidth: 220 }}
            />
            <Select
              value={silenceStatusFilter}
              options={silenceStatusOptions}
              onChange={(value) => setSilenceStatusFilter(value as typeof silenceStatusFilter)}
              style={{ width: 160 }}
            />
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleSilenceRuleModalOpen()}>
            新增靜音規則
          </Button>
        </Col>
      </Row>
    );

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {silenceRulesError && (
          <Alert type="error" showIcon message="無法載入靜音規則" description={silenceRulesError} />
        )}
        {silenceRulesLoading ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Spin tip="正在載入靜音規則..." />
          </div>
        ) : (
          <DataTable<SilenceRuleRecord>
            dataSource={filteredSilenceRules}
            columns={silenceColumns}
            rowKey={(record) => record.id}
            titleContent={toolbar}
            locale={{
              emptyText: <Empty description={silenceRules.length ? '查無符合條件的靜音規則' : '尚未建立靜音規則'} />,
            }}
          />
        )}
      </Space>
    );
  };

  const handleOpenDetail = useCallback((record: IncidentRecord) => {
    setActiveIncidentId(record.id);
    setDetailModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    setActiveIncidentId(null);
  }, []);

  const handleCreateSilence = useCallback((record: IncidentRecord) => {
    setSilenceIncidentId(record.id);
    setSilenceModalOpen(true);
  }, []);

  const handleCloseSilence = useCallback(() => {
    setSilenceModalOpen(false);
    setSilenceIncidentId(null);
  }, []);

  const handleSilenceSuccess = useCallback(() => {
    setSilenceModalOpen(false);
    setSilenceIncidentId(null);
    message.success('靜音規則創建成功');
  }, [message]);

  const handleStatusChange = useCallback(
    (record: IncidentRecord, nextStatus: 'acknowledged' | 'resolved') => {
      const statusLabel = getStatusLabel(nextStatus);
      modal.confirm({
        title: `將事件標記為「${statusLabel}」`,
        content: (
          <Space direction="vertical" size={8}>
            <Text strong>{record.summary}</Text>
            <Text type="secondary">此操作將更新事件狀態並同步至後續工作流程。</Text>
          </Space>
        ),
        okText: '確認',
        cancelText: '取消',
        onOk: async () => {
          const timestamp = new Date().toISOString();
          setOverrides((prev) => {
            const existing = prev[record.id] ?? {};
            return {
              ...prev,
              [record.id]: {
                ...existing,
                status: nextStatus,
                acknowledged_at: nextStatus === 'acknowledged' ? timestamp : existing.acknowledged_at,
                resolved_at: nextStatus === 'resolved' ? timestamp : existing.resolved_at,
              },
            };
          });
          message.success(`事件已標記為${statusLabel}`);
        },
      });
    },
    [message, modal],
  );

  const handleBatchUpdate = useCallback(
    (nextStatus: 'acknowledged' | 'resolved') => {
      if (!selectedRowKeys.length) return;

      const statusLabel = getStatusLabel(nextStatus);
      modal.confirm({
        title: `批次更新 ${selectedRowKeys.length} 筆事件`,
        content: `將所選事件標記為「${statusLabel}」，確認要繼續嗎？`,
        okText: '批次更新',
        cancelText: '取消',
        onOk: async () => {
          const timestamp = new Date().toISOString();
          setOverrides((prev) => {
            const updated = { ...prev };
            selectedRowKeys.forEach((key) => {
              const id = String(key);
              const existing = updated[id] ?? {};
              updated[id] = {
                ...existing,
                status: nextStatus,
                acknowledged_at: nextStatus === 'acknowledged' ? timestamp : existing.acknowledged_at,
                resolved_at: nextStatus === 'resolved' ? timestamp : existing.resolved_at,
              };
            });
            return updated;
          });
          setSelectedRowKeys([]);
          message.success(`已更新 ${selectedRowKeys.length} 筆事件狀態`);
        },
      });
    },
    [message, modal, selectedRowKeys],
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      setOverrides({});
      setSelectedRowKeys([]);
      message.success('事件列表已更新');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重新整理事件列表失敗';
      message.error(errorMessage);
    }
  }, [message, refetch]);


  const relatedIncidents = useMemo(() => {
    if (!currentIncident) return [];
    return incidentsWithOverrides.filter(
      (incident) =>
        incident.id !== currentIncident.id &&
        incident.resource_name &&
        currentIncident.resource_name &&
        incident.resource_name === currentIncident.resource_name,
    );
  }, [currentIncident, incidentsWithOverrides]);

  const columns: ColumnsType<IncidentRecord> = useMemo(() => [
    {
      title: '嚴重性',
      dataIndex: 'severity',
      width: 120,
      render: (severity: IncidentRecord['severity']) => {
        if (!severity) return '—';
        const normalized = severity.toLowerCase();
        return (
          <StatusBadge
            label={getSeverityLabel(normalized)}
            tone={severityToneMap[normalized] ?? 'neutral'}
          />
        );
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      render: (_: string, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Button type="link" style={{ padding: 0 }} onClick={() => handleOpenDetail(record)}>
            {record.summary}
          </Button>
          <Space size={8} wrap>
            {record.service && <Tag color="geekblue">{record.service}</Tag>}
            {record.storm_group && (
              <Tag icon={<BellOutlined />} color="volcano">
                風暴：{record.storm_group}
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: '資源',
      dataIndex: 'resource_name',
      width: 180,
      render: (value: IncidentRecord['resource_name']) =>
        value ? <Tag color="cyan">{value}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: '業務影響',
      dataIndex: 'business_impact',
      width: 140,
      render: (impact: IncidentRecord['business_impact']) => {
        if (!impact) return <Text type="secondary">—</Text>;
        const normalized = impact.toLowerCase();
        return (
          <StatusBadge
            label={impact}
            tone={impactToneMap[normalized] ?? 'neutral'}
          />
        );
      },
    },
    {
      title: '狀態',
      dataIndex: 'status',
      width: 140,
      render: (status: IncidentRecord['status']) => {
        if (!status) return <Text type="secondary">—</Text>;
        const normalized = status.toLowerCase();
        return (
          <StatusBadge
            label={getStatusLabel(normalized)}
            tone={statusToneMap[normalized] ?? 'neutral'}
          />
        );
      },
    },
    {
      title: '處理人',
      dataIndex: 'assigneeName',
      width: 180,
      render: (_: IncidentRecord['assigneeName'], record) =>
        record.assigneeName ? (
          <Space size={6}>
            <TeamOutlined />
            <span>{record.assigneeName}</span>
          </Space>
        ) : (
          <Text type="secondary">未指派</Text>
        ),
    },
    {
      title: '觸發時間',
      dataIndex: 'created_at',
      width: 200,
      render: (createdAt: IncidentRecord['created_at']) => (
        <Space direction="vertical" size={0}>
          <Text>{formatDateTime(createdAt)}</Text>
          <Text type="secondary">{formatRelative(createdAt)}</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 220,
      align: 'right',
      render: (_: unknown, record) => (
        <Space size={8}>
          {record.status !== 'acknowledged' && (
            <Tooltip title="標記為已確認">
              <Button type="link" onClick={() => handleStatusChange(record, 'acknowledged')}>
                確認
              </Button>
            </Tooltip>
          )}
          {record.status !== 'resolved' && (
            <Tooltip title="標記為已解決">
              <Button type="link" onClick={() => handleStatusChange(record, 'resolved')}>
                解決
              </Button>
            </Tooltip>
          )}
          <Tooltip title="AI 事件分析">
            <Button type="link" onClick={() => handleOpenAIAnalysis(record)}>
              AI 分析
            </Button>
          </Tooltip>
          <Tooltip title="建立靜音規則">
            <Button type="link" onClick={() => handleCreateSilence(record)}>
              靜音
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [handleCreateSilence, handleOpenAIAnalysis, handleOpenDetail, handleStatusChange]);

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys: any) => setSelectedRowKeys(keys),
      preserveSelectedRowKeys: true,
    }),
    [selectedRowKeys],
  );

  const tableToolbar = (
    <Row justify="space-between" align="middle" gutter={[16, 12]}>
      <Col flex="auto">
        <Space size={12} wrap>
          <Search
            allowClear
            placeholder="搜尋摘要、資源、規則..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            style={{ minWidth: 260 }}
          />
          <Select
            value={severityFilter}
            options={severityOptions}
            onChange={(value) => setSeverityFilter(value)}
            style={{ width: 160 }}
          />
          <Select
            value={statusFilter}
            options={statusOptions}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 180 }}
          />
        </Space>
      </Col>
      <Col>
        <Space size={8} wrap>
          {selectedRowKeys.length > 0 && (
            <Space size={8} wrap>
              <Button
                icon={<CheckCircleOutlined />}
                type="primary"
                ghost
                onClick={() => handleBatchUpdate('acknowledged')}
              >
                批次確認
              </Button>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={() => handleBatchUpdate('resolved')}
              >
                批次解決
              </Button>
            </Space>
          )}
          <Tooltip title="重新整理">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={incidentsLoading}
            />
          </Tooltip>
        </Space>
      </Col>
    </Row>
  );

  const detailTabs = useMemo(() => {
    if (!currentIncident) return [];

    return [
      {
        key: 'summary',
        label: '基本資訊',
        children: (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions column={2} bordered labelStyle={{ width: 140 }}>
              <Descriptions.Item label="摘要" span={2}>
                <Text strong>{currentIncident.summary}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="嚴重性">
                <StatusBadge
                  label={getSeverityLabel(currentIncident.severity)}
                  tone={currentIncident.severity ? severityToneMap[currentIncident.severity] ?? 'neutral' : 'neutral'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="狀態">
                <StatusBadge
                  label={getStatusLabel(currentIncident.status)}
                  tone={currentIncident.status ? statusToneMap[currentIncident.status] ?? 'neutral' : 'neutral'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="來源">
                {currentIncident.source ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="觸發時間">
                <Space direction="vertical" size={0}>
                  <Text>{formatDateTime(currentIncident.created_at)}</Text>
                  <Text type="secondary">{formatRelative(currentIncident.created_at)}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="關聯規則">
                {currentIncident.ruleName ? (
                  <Space size={8}>
                    <ScheduleOutlined />
                    <span>{currentIncident.ruleName}</span>
                  </Space>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="處理人">
                {currentIncident.assigneeName ? (
                  <Space size={6}>
                    <TeamOutlined />
                    <span>{currentIncident.assigneeName}</span>
                  </Space>
                ) : (
                  <Text type="secondary">尚未指派</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="業務影響">
                {currentIncident.business_impact ? (
                  <StatusBadge
                    label={currentIncident.business_impact}
                    tone={impactToneMap[currentIncident.business_impact.toLowerCase()] ?? 'neutral'}
                  />
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Descriptions.Item>
            </Descriptions>

            {currentIncident.labels && Object.keys(currentIncident.labels).length > 0 && (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text strong>事件標籤</Text>
                <Space wrap>
                  {Object.entries(currentIncident.labels).map(([key, value]) => (
                    <Tag key={`${currentIncident.id}-${key}`} icon={<TagsOutlined />}
                    >
                      {key}: {value}
                    </Tag>
                  ))}
                </Space>
              </Space>
            )}

            {currentIncident.annotations?.playbook && (
              <Button
                type="link"
                icon={<LinkOutlined />}
                onClick={() => window.open(String(currentIncident.annotations?.playbook), '_blank', 'noopener')}
              >
                開啟 Runbook
              </Button>
            )}
          </Space>
        ),
      },
      {
        key: 'history',
        label: '處理歷史',
        children: (
          <Timeline
            mode="left"
            items={[
              {
                color: 'red',
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>事件觸發</Text>
                    <Text>{formatDateTime(currentIncident.created_at)}</Text>
                    {currentIncident.source && (
                      <Text type="secondary">來源：{currentIncident.source}</Text>
                    )}
                  </Space>
                ),
              },
              currentIncident.acknowledged_at
                ? {
                  color: 'gold',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>已確認</Text>
                      <Text>{formatDateTime(currentIncident.acknowledged_at)}</Text>
                      {currentIncident.assigneeName && (
                        <Text type="secondary">由 {currentIncident.assigneeName} 確認</Text>
                      )}
                    </Space>
                  ),
                }
                : {
                  color: 'gray',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>等待確認</Text>
                      <Text type="secondary">尚未接手此事件</Text>
                    </Space>
                  ),
                },
              currentIncident.resolved_at
                ? {
                  color: 'green',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>已解決</Text>
                      <Text>{formatDateTime(currentIncident.resolved_at)}</Text>
                    </Space>
                  ),
                }
                : {
                  color: 'blue',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>目前狀態</Text>
                      <Text type="secondary">{getStatusLabel(currentIncident.status)}</Text>
                    </Space>
                  ),
                },
            ]}
          />
        ),
      },
      {
        key: 'related',
        label: '關聯事件',
        children: relatedIncidents.length ? (
          <List
            itemLayout="horizontal"
            dataSource={relatedIncidents}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" onClick={() => handleOpenDetail(item)}>
                    檢視
                  </Button>,
                  <Button key="silence" type="link" onClick={() => handleCreateSilence(item)}>
                    靜音
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.summary}
                  description={(
                    <Space size={12} wrap>
                      <StatusBadge
                        label={getStatusLabel(item.status)}
                        tone={item.status ? statusToneMap[item.status] ?? 'neutral' : 'neutral'}
                      />
                      <Text type="secondary">{formatRelative(item.created_at)}</Text>
                    </Space>
                  )}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="目前沒有其他相關事件" />
        ),
      },
      {
        key: 'automation',
        label: '自動化',
        children: (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {currentIncident.automation_id ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="自動化工作流程">
                  {currentIncident.automation_id}
                </Descriptions.Item>
                <Descriptions.Item label="觸發條件">
                  {currentIncident.triggerThreshold ?? '—'}
                </Descriptions.Item>
                <Descriptions.Item label="最後執行時間">
                  {currentIncident.resolved_at ? formatDateTime(currentIncident.resolved_at) : '尚未執行'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="尚未連結自動化流程" />
            )}

            {currentIncident.annotations && Object.keys(currentIncident.annotations).length > 0 && (
              <Space direction="vertical" size={12}>
                <Text strong>備註</Text>
                <List
                  size="small"
                  dataSource={Object.entries(currentIncident.annotations)}
                  renderItem={([key, value]) => (
                    <List.Item>
                      <Space size={8}>
                        <Text strong>{key}</Text>
                        <Text type="secondary">{String(value)}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Space>
            )}
          </Space>
        ),
      },
    ];
  }, [currentIncident, handleCreateSilence, handleOpenDetail, relatedIncidents]);

  const kpiCards = useMemo(
    () => [
      {
        key: 'active',
        title: '活躍事件',
        value: stats.active,
        unit: '件',
        status: stats.critical > 0 ? 'danger' : stats.active > 0 ? 'warning' : 'success',
        description: `${stats.critical} 件嚴重，${stats.acknowledged} 件處理中`,
        icon: <FireOutlined style={{ fontSize: 28, color: '#ff7875' }} />,
        onClick: () => setStatusFilter('open'),
      },
      {
        key: 'resolved-today',
        title: '今日已解決',
        value: stats.resolvedToday,
        unit: '件',
        status: stats.resolvedToday > 0 ? 'success' : 'info',
        description: '包含自動化與人工處理',
        icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
        onClick: () => setStatusFilter('resolved'),
      },
      {
        key: 'mttr',
        title: '平均解決時間',
        value: stats.avgResolution ?? '--',
        unit: stats.avgResolution ? '小時' : undefined,
        status: stats.avgResolution && stats.avgResolution > 3 ? 'warning' : 'info',
        description: '以最近成功解決事件計算',
        icon: <ClockCircleOutlined style={{ fontSize: 28, color: '#faad14' }} />,
        onClick: () => onNavigate?.('incident-list', { highlight: 'mttr' }),
      },
      {
        key: 'automation',
        title: '自動化處理率',
        value: stats.automationRate,
        unit: '%',
        status: stats.automationRate >= 50 ? 'success' : 'info',
        description: '過去 24 小時自動化執行成功率',
        icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#9254de' }} />,
        onClick: () => setStatusFilter('automated'),
      },
    ],
    [onNavigate, stats],
  );

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'incident-list',
        label: '事件列表',
      },
      {
        key: 'alerting-rules',
        label: '事件規則',
      },
      {
        key: 'silences',
        label: '靜音規則',
      },
    ],
    [],
  );

  const renderIncidentList = () => (
    <>
      <Row gutter={[16, 16]}>
        {kpiCards.map(({ key: cardKey, ...card }) => (
          <Col key={cardKey} xs={24} sm={12} xl={6}>
            <ContextualKPICard
              {...card}
              status={card.status as ContextualKPICardProps['status']}
            />
          </Col>
        ))}
      </Row>

      {incidentsError && (
        <Alert
          type="error"
          showIcon
          message="無法載入事件列表"
          description={incidentsError.message}
        />
      )}

      <DataTable<IncidentRecord>
        dataSource={filteredIncidents}
        columns={columns}
        rowKey={(record) => record.id}
        loading={incidentsLoading}
        rowSelection={rowSelection}
        titleContent={tableToolbar}
        locale={{
          emptyText: (
            <Empty
              description={searchTerm ? '查無符合條件的事件' : '目前沒有事件'}
            />
          ),
        }}
      />
    </>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'incident-list':
        return renderIncidentList();
      case 'alerting-rules':
        return renderAlertingRules();
      case 'silences':
        return renderSilenceRules();
      default:
        return renderIncidentList();
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="事件管理"
        subtitle="集中掌握事件熱度、篩選噪音並協調跨團隊作業"
        description="查看活躍事件、應用批次操作，並深入檢視事件上下文與自動化流程。"
      />

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as typeof availableTabs[number])}
      />

      {(incidentsLoading && !incidentsWithOverrides.length) || usersLoading ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
          <Spin tip="正在載入事件資料..." size="large" />
        </div>
      ) : (
        renderActiveTab()
      )}

      <GlassModal
        open={ruleModalOpen}
        onCancel={handleRuleModalClose}
        onOk={handleRuleSubmit}
        okText={editingRule ? '儲存變更' : '建立規則'}
        title={editingRule ? '編輯事件規則' : '新增事件規則'}
      >
        <Form<IncidentRuleFormValues> form={ruleForm} layout="vertical">
          <Form.Item
            name="name"
            label="規則名稱"
            rules={[{ required: true, message: '請輸入規則名稱' }]}
          >
            <Input placeholder="例如：Production DB CPU" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="簡短描述此規則的用途" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="severity"
                label="嚴重性"
                rules={[{ required: true, message: '請選擇嚴重性' }]}
              >
                <Select
                  options={['critical', 'high', 'medium', 'warning', 'low', 'info'].map((value) => ({
                    value,
                    label: getSeverityLabel(value),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="狀態"
                rules={[{ required: true, message: '請選擇狀態' }]}
              >
                <Select
                  options={['active', 'paused', 'draft'].map((value) => ({
                    value,
                    label: incidentRuleStatusLabelMap[value as IncidentRuleRecord['status']],
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="owner" label="負責團隊/人員">
            <Input placeholder="例如：資料庫值班團隊" />
          </Form.Item>

          <Form.Item
            name="conditionsText"
            label="觸發條件"
            rules={[{ required: true, message: '請輸入至少一個條件' }]}
            extra="每行代表一個條件，例如：resource.type = database"
          >
            <Input.TextArea rows={4} placeholder={'resource.type = database\ncpu.usage > 85%'} />
          </Form.Item>

          <Form.Item
            name="actionsText"
            label="動作 (選填)"
            extra="每行代表一個動作，例如：通知: SRE Oncall"
          >
            <Input.TextArea rows={3} placeholder={'通知: SRE Oncall\n自動化: restart-service'} />
          </Form.Item>
        </Form>
      </GlassModal>

      <GlassModal
        width={760}
        open={aiAnalysisModalOpen}
        onCancel={handleCloseAIAnalysis}
        footer={null}
        title={analysisTarget ? `AI 事件分析：${analysisTarget.summary}` : 'AI 事件分析'}
      >
        {analysisLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <Spin tip="AI 正在分析事件..." />
          </div>
        ) : analysisResult ? (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Alert
              type="info"
              showIcon
              message="AI 初步判斷"
              description={analysisResult.summary}
            />

            <Space direction="vertical" size={12}>
              <Text strong>可能原因</Text>
              <List
                size="small"
                dataSource={analysisResult.probableCauses}
                renderItem={(item, idx) => (
                  <List.Item>
                    <Space align="start">
                      <Text strong>{idx + 1}.</Text>
                      <Text type="secondary">{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Space>

            <Space direction="vertical" size={12}>
              <Text strong>建議行動</Text>
              <List
                size="small"
                dataSource={analysisResult.recommendedActions}
                renderItem={(item) => (
                  <List.Item>
                    <Space align="start">
                      <Text strong>•</Text>
                      <Text type="secondary">{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Space>

            <Space direction="vertical" size={8}>
              <Text strong>影響評估</Text>
              <Text type="secondary">{analysisResult.impact}</Text>
            </Space>

            {analysisResult.relatedSignals && (
              <Space direction="vertical" size={8}>
                <Text strong>重點觀察指標</Text>
                <Space wrap>
                  {analysisResult.relatedSignals.map((signal) => (
                    <Tag key={signal} color="purple">
                      {signal}
                    </Tag>
                  ))}
                </Space>
              </Space>
            )}

            <Text type="secondary">AI 判斷信心：{analysisResult.confidence}%</Text>
          </Space>
        ) : (
          <Empty description="尚未取得 AI 分析結果" />
        )}
      </GlassModal>

      <GlassModal
        open={silenceRuleModalOpen}
        onCancel={handleSilenceRuleModalClose}
        onOk={handleSilenceRuleSubmit}
        okText={editingSilenceRule ? '儲存變更' : '建立靜音規則'}
        title={editingSilenceRule ? '編輯靜音規則' : '新增靜音規則'}
      >
        <Form<SilenceRuleFormValues> form={silenceRuleForm} layout="vertical">
          <Form.Item
            name="name"
            label="靜音名稱"
            rules={[{ required: true, message: '請輸入靜音名稱' }]}
          >
            <Input placeholder="例如：資料庫夜間維護" />
          </Form.Item>

          <Form.Item
            name="scope"
            label="作用範圍"
            rules={[{ required: true, message: '請輸入靜音範圍條件' }]}
            extra="支援標籤條件，例如：resource.type = database AND env = production"
          >
            <Input.TextArea rows={3} placeholder={'resource.type = database\nenv = production'} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="狀態"
                rules={[{ required: true, message: '請選擇狀態' }]}
              >
                <Select
                  options={['active', 'scheduled', 'expired'].map((value) => ({
                    value,
                    label: silenceStatusLabelMap[value as SilenceRuleRecord['status']],
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="createdBy" label="建立者">
                <Input placeholder="例如：Admin User" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="schedule"
            label="排程"
            rules={[{ required: true, message: '請填寫排程資訊' }]}
            extra="例如：每週二 01:00 ~ 03:00 或 立即生效，持續 4 小時"
          >
            <Input.TextArea rows={2} placeholder="每週二 01:00 ~ 03:00" />
          </Form.Item>

          <Form.Item name="nextExecution" label="下次生效時間" extra="ISO 時間格式或保留空白">
            <Input placeholder="2025-09-23T01:00:00Z" />
          </Form.Item>

          <Form.Item name="tagsText" label="標籤 (選填)" extra="以換行或逗號分隔">
            <Input.TextArea rows={2} placeholder={'db\nmaintenance'} />
          </Form.Item>
        </Form>
      </GlassModal>

      <GlassModal
        width={920}
        open={detailModalOpen && Boolean(currentIncident)}
        onCancel={handleCloseDetail}
        title={currentIncident ? `事件詳情：${currentIncident.summary}` : '事件詳情'}
        footer={currentIncident ? (
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={handleCloseDetail}>關閉</Button>
            <Space size={12} wrap>
              <Button icon={<RobotOutlined />} onClick={() => handleOpenAIAnalysis(currentIncident)}>
                AI 分析
              </Button>
              <Button icon={<PauseCircleOutlined />} onClick={() => handleCreateSilence(currentIncident)}>
                建立靜音
              </Button>
              {currentIncident.status !== 'acknowledged' && (
                <Button
                  type="primary"
                  ghost
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(currentIncident, 'acknowledged')}
                >
                  標記已確認
                </Button>
              )}
              {currentIncident.status !== 'resolved' && (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleStatusChange(currentIncident, 'resolved')}
                >
                  標記已解決
                </Button>
              )}
            </Space>
          </Space>
        ) : null}
      >
        {currentIncident && (
          <Tabs defaultActiveKey="summary" items={detailTabs} />
        )}
      </GlassModal>

      <CreateSilenceModal
        open={silenceModalOpen}
        eventId={silenceIncidentId}
        onCancel={handleCloseSilence}
        onSuccess={handleSilenceSuccess}
      />
    </Space>
  );
};

export default IncidentsPage;
