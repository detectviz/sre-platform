import {
  AlertOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {
  Badge,
  Col,
  Input,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useEvents } from '../../hooks';
import type { Event } from '../../hooks';

dayjs.extend(relativeTime);

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'magenta',
  warning: 'volcano',
  info: 'geekblue'
};

const STATUS_COLOR: Record<string, string> = {
  new: 'processing',
  acknowledged: 'warning',
  in_progress: 'gold',
  resolved: 'success',
  silenced: 'default'
};

const STATUS_TEXT: Record<string, string> = {
  new: '未處理',
  acknowledged: '已指派',
  in_progress: '處理中',
  resolved: '已解決',
  silenced: '靜音中'
};

const STATUS_OPTIONS = [
  { label: '全部事件', value: 'all' },
  { label: '活躍事件', value: 'active' },
  { label: '處理中', value: 'in_progress' },
  { label: '已解決', value: 'resolved' },
  { label: '靜音中', value: 'silenced' }
] as const;

const SEVERITY_OPTIONS = [
  { label: '所有嚴重度', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' }
] as const;

const formatStatus = (status: Event['status']) => STATUS_TEXT[status ?? ''] || status || '未知';

const isActiveStatus = (status: Event['status']) =>
  status === 'new' || status === 'acknowledged' || status === 'in_progress';

// 事件列表頁面，呈現最新的事件狀態與重點資訊
export const EventsListPage = () => {
  const { data, loading } = useEvents();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]['value']>('all');
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_OPTIONS)[number]['value']>('all');
  const [keyword, setKeyword] = useState('');

  const events = data?.items ?? [];

  const stats = useMemo(() => {
    if (!events.length) {
      return {
        total: 0,
        active: 0,
        criticalActive: 0,
        resolvedToday: 0,
        automationRate: 0,
        avgAckMinutes: 0
      };
    }

    const now = dayjs();
    const activeEvents = events.filter((event) => isActiveStatus(event.status));
    const criticalActive = activeEvents.filter((event) => event.severity === 'critical').length;
    const resolvedToday = events.filter(
      (event) => event.resolved_at && dayjs(event.resolved_at).isSame(now, 'day')
    ).length;
    const automationCount = events.filter((event) => (event.automation_actions ?? []).length > 0).length;
    const automationRate = Math.round((automationCount / events.length) * 100);

    const ackDurations = events
      .map((event) => {
        if (!event.acknowledged_at || !event.trigger_time) {
          return null;
        }
        return dayjs(event.acknowledged_at).diff(dayjs(event.trigger_time), 'minute');
      })
      .filter((duration): duration is number => duration !== null && duration >= 0);

    const avgAckMinutes = ackDurations.length
      ? ackDurations.reduce((sum, value) => sum + value, 0) / ackDurations.length
      : 0;

    return {
      total: events.length,
      active: activeEvents.length,
      criticalActive,
      resolvedToday,
      automationRate,
      avgAckMinutes
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? isActiveStatus(event.status)
            : event.status === statusFilter;

      const matchSeverity = severityFilter === 'all' ? true : event.severity === severityFilter;

      const text = `${event.event_key ?? ''} ${event.summary ?? ''} ${event.service_impact ?? ''}`;
      const matchKeyword = keyword ? text.toLowerCase().includes(keyword.toLowerCase()) : true;

      return matchStatus && matchSeverity && matchKeyword;
    });
  }, [events, keyword, severityFilter, statusFilter]);

  const ackTrendBaseline = 20; // 期望 20 分鐘內完成指派
  const ackTrendValue = stats.avgAckMinutes - ackTrendBaseline;
  const automationBaseline = 35;
  const automationTrend = stats.automationRate - automationBaseline;

  const columns: ColumnsType<Event> = [
    {
      title: '事件編號',
      dataIndex: 'event_key',
      key: 'event_key',
      width: 140,
      render: (value: Event['event_key']) => value || '—'
    },
    {
      title: '事件摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (value: Event['summary'], record) => (
        <Space direction="vertical" size={4}>
          <Typography.Text strong>{value || '—'}</Typography.Text>
          {record.service_impact ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.service_impact}
            </Typography.Text>
          ) : null}
          <Space size={[8, 4]} wrap>
            {(record.tags ?? []).slice(0, 3).map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </Space>
        </Space>
      )
    },
    {
      title: '嚴重性',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (value: Event['severity']) =>
        value ? (
          <Tag color={SEVERITY_COLOR[value] || 'default'} bordered={false}>
            {value.toUpperCase()}
          </Tag>
        ) : (
          '—'
        )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: Event['status']) => (
        <Badge status={STATUS_COLOR[value ?? ''] || 'default'} text={formatStatus(value)} />
      )
    },
    {
      title: '關聯資源',
      dataIndex: 'resource_name',
      key: 'resource_name',
      width: 180,
      render: (value: Event['resource_name'], record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text>{value || '—'}</Typography.Text>
          {record.rule_name ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              規則：{record.rule_name}
            </Typography.Text>
          ) : null}
        </Space>
      )
    },
    {
      title: '指派對象',
      dataIndex: ['assignee', 'display_name'],
      key: 'assignee',
      width: 160,
      render: (_: unknown, record: Event) => record.assignee?.display_name || record.assignee?.username || '—'
    },
    {
      title: '觸發時間',
      dataIndex: 'trigger_time',
      key: 'trigger_time',
      width: 200,
      render: (value: Event['trigger_time']) =>
        value ? dayjs(value).format('YYYY/MM/DD HH:mm:ss') : '—'
    },
    {
      title: '最近更新',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 200,
      render: (value: Event['updated_at']) =>
        value ? dayjs(value).fromNow() : '—'
    },
    {
      title: '自動化',
      dataIndex: 'automation_actions',
      key: 'automation_actions',
      width: 140,
      render: (value: Event['automation_actions']) => (
        <Tooltip title="事件是否觸發自動化腳本">
          <Badge
            status={value && value.length > 0 ? 'processing' : 'default'}
            text={value && value.length > 0 ? `已觸發 (${value.length})` : '尚未觸發'}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="事件列表"
        subtitle="聚焦當前活躍事件，快速了解處理進度與業務影響。"
        icon={<AlertOutlined />}
      />

      <Row gutter={[16, 16]} className="kpi-grid">
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="活躍事件"
            value={stats.active}
            unit="件"
            status={stats.criticalActive > 0 ? 'critical' : stats.active > 0 ? 'warning' : 'normal'}
            description={`嚴重等級 ${stats.criticalActive} 件 / 需跟進 ${stats.active} 件`}
            icon={<FireOutlined />}
            onClick={() => setStatusFilter('active')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="今日已解決"
            value={stats.resolvedToday}
            unit="件"
            trend={stats.resolvedToday > 0 ? '+12% 對比昨日' : '持平'}
            trendDirection={stats.resolvedToday > 0 ? 'up' : 'stable'}
            status="success"
            description="值班團隊維持良好節奏"
            icon={<ClockCircleOutlined />}
            onClick={() => setStatusFilter('resolved')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="平均指派時間"
            value={stats.avgAckMinutes.toFixed(1)}
            unit="分鐘"
            trend={`${ackTrendValue >= 0 ? '+' : ''}${ackTrendValue.toFixed(1)} vs 目標`}
            trendDirection={ackTrendValue <= 0 ? 'down' : 'up'}
            status={ackTrendValue <= 0 ? 'success' : 'warning'}
            description="小於 20 分鐘視為達標"
            icon={<ClockCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="自動化處理率"
            value={stats.automationRate}
            unit="%"
            trend={`${automationTrend >= 0 ? '+' : ''}${automationTrend.toFixed(0)}% 對比目標`}
            trendDirection={automationTrend >= 0 ? 'up' : 'down'}
            status={stats.automationRate >= 35 ? 'success' : 'warning'}
            description="高風險事件優先觸發自動化"
            icon={<ThunderboltOutlined />}
            onClick={() => setStatusFilter('active')}
          />
        </Col>
      </Row>

      <SectionCard
        title="事件追蹤"
        extra={
          <Space size="middle">
            <Segmented
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as (typeof STATUS_OPTIONS)[number]['value'])}
            />
            <Segmented
              options={SEVERITY_OPTIONS}
              value={severityFilter}
              onChange={(value) =>
                setSeverityFilter(value as (typeof SEVERITY_OPTIONS)[number]['value'])
              }
            />
            <Input.Search
              allowClear
              placeholder="搜尋事件編號、摘要或影響"
              onSearch={(value) => setKeyword(value)}
              onChange={(event) => setKeyword(event.target.value)}
              style={{ width: 260 }}
            />
          </Space>
        }
      >
        <Table<Event>
          rowKey="id"
          columns={columns}
          dataSource={filteredEvents}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
