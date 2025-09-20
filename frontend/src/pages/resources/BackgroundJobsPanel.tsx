import { useMemo } from 'react';
import { Space, Typography, Tooltip, Button, Alert, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DataTable, StatusBadge } from '../../components';
import type { StatusTone } from '../../components';
import type { BackgroundJob } from '../../types/backgroundJobs';

const { Text, Title } = Typography;

const jobStatusToneMap: Record<string, StatusTone> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'danger',
  paused: 'neutral',
};

const jobStatusLabelMap: Record<string, string> = {
  healthy: '健康',
  warning: '警告',
  critical: '危急',
  paused: '暫停',
};

const formatDurationShort = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  if (value < 1000) {
    return `${value} ms`;
  }
  if (value < 60_000) {
    const seconds = value / 1000;
    return `${seconds.toFixed(seconds < 10 ? 1 : 0)} 秒`;
  }
  const minutes = Math.floor(value / 60_000);
  const seconds = Math.round((value % 60_000) / 1000);
  return `${minutes} 分 ${seconds.toString().padStart(2, '0')} 秒`;
};

const formatRelativeTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }
  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return value;
  }
  return `${parsed.fromNow()} · ${parsed.format('YYYY/MM/DD HH:mm:ss')}`;
};

type BackgroundJobsPanelProps = {
  jobs: BackgroundJob[];
  loading: boolean;
  error: unknown;
  isFallback: boolean;
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  onRefresh: () => void;
};

export const BackgroundJobsPanel = ({ jobs, loading, error, isFallback, summary, onRefresh }: BackgroundJobsPanelProps) => {
  const unhealthyJobs = useMemo(
    () => jobs.filter((job) => job.status === 'warning' || job.status === 'critical'),
    [jobs],
  );

  const jobColumns = useMemo<ColumnsType<BackgroundJob>>(() => [
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: BackgroundJob['status']) => (
        <StatusBadge
          label={jobStatusLabelMap[value ?? 'healthy'] ?? value ?? '健康'}
          tone={jobStatusToneMap[value ?? 'healthy'] ?? 'neutral'}
        />
      ),
    },
    {
      title: '作業',
      dataIndex: 'name',
      key: 'name',
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text strong>{record.name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
          <Space size={4} wrap>
            {record.owner_team && <Tag color="blue">Owner {record.owner_team}</Tag>}
            {(record.tags ?? []).slice(0, 3).map((tag) => (
              <Tag key={`${record.id}-${tag}`}>{tag}</Tag>
            ))}
            {record.tags && record.tags.length > 3 && <Tag>+{record.tags.length - 3}</Tag>}
          </Space>
          {record.metrics && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.metrics.processedResources !== undefined && (
                <span>
                  處理資源 {record.metrics.processedResources}
                  {' · '}
                </span>
              )}
              {record.metrics.healthy !== undefined && record.metrics.warning !== undefined && record.metrics.critical !== undefined && (
                <span>
                  健康 {record.metrics.healthy} / 警告 {record.metrics.warning} / 危急 {record.metrics.critical}
                  {' · '}
                </span>
              )}
              {record.metrics.unhealthyChannels !== undefined && (
                <span>
                  通道異常 {record.metrics.unhealthyChannels}
                  {' · '}
                </span>
              )}
              {record.metrics.checkedAt && <span>檢查時間 {dayjs(record.metrics.checkedAt).format('HH:mm:ss')}</span>}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '排程',
      key: 'schedule',
      width: 160,
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={2}>
          <Text>
            {record.interval_minutes ? `每 ${record.interval_minutes} 分鐘` : '—'}
          </Text>
          {record.timezone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.timezone}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '上次執行',
      key: 'lastRun',
      width: 220,
      render: (_: unknown, record: BackgroundJob) => (
        <Space direction="vertical" size={2}>
          <Text>{formatRelativeTime(record.last_run_at)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            耗時 {formatDurationShort(record.last_duration_ms)}
          </Text>
        </Space>
      ),
    },
    {
      title: '下次排程',
      dataIndex: 'next_run_at',
      key: 'nextRun',
      width: 220,
      render: (value: BackgroundJob['next_run_at']) => formatRelativeTime(value),
    },
    {
      title: '最近訊息',
      dataIndex: 'last_message',
      key: 'lastMessage',
      render: (value: string | undefined) => (
        <Tooltip title={value}>
          <Text ellipsis style={{ maxWidth: 320 }}>
            {value ?? '—'}
          </Text>
        </Tooltip>
      ),
    },
  ], [jobs]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>背景作業狀態</Title>
        <Space size={8} wrap>
          <Tag color="blue">總數 {summary.total}</Tag>
          <Tag color="green">健康 {summary.healthy}</Tag>
          <Tag color="gold">警告 {summary.warning}</Tag>
          <Tag color="red">危急 {summary.critical}</Tag>
          <Tooltip title="重新整理背景作業狀態">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
        </Space>
      </Space>

      {unhealthyJobs.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`有 ${unhealthyJobs.length} 個背景作業需要關注`}
          description={unhealthyJobs.map((job) => job.name).join('、')}
        />
      )}

      {isFallback && (
        <Alert
          type="info"
          showIcon
          message="目前顯示為離線模擬的背景作業資料"
        />
      )}

      {Boolean(error) && !loading && (
        <Alert
          type="error"
          showIcon
          message="無法載入背景作業資料"
          description={error instanceof Error ? error.message : '請稍後再試'}
        />
      )}

      <DataTable<BackgroundJob>
        dataSource={jobs}
        columns={jobColumns}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        titleContent={<span style={{ fontWeight: 600 }}>排程作業列表</span>}
      />
    </Space>
  );
};
