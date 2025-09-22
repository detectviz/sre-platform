import { AimOutlined, HistoryOutlined } from '@ant-design/icons';
import { Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useExecutions } from '../../hooks';
import type { Execution } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  running: 'blue',
  success: 'green',
  failed: 'red',
  cancelled: 'magenta',
  timeout: 'orange'
};

const TRIGGER_COLOR: Record<string, string> = {
  manual: 'geekblue',
  schedule: 'cyan',
  event: 'purple',
  api: 'gold'
};

// 執行日誌頁面，協助追蹤腳本執行狀態與耗時
export const ExecutionLogPage = () => {
  const { data, loading } = useExecutions();
  const [keyword, setKeyword] = useState('');
  const executions = data?.items ?? [];

  const stats = useMemo(() => {
    const success = executions.filter((execution) => execution.status === 'success').length;
    const avgDuration = executions.length
      ? executions.reduce((sum, execution) => sum + (execution.duration_ms ?? 0), 0) / executions.length
      : 0;
    return {
      total: executions.length,
      success,
      successRate: executions.length ? Math.round((success / executions.length) * 100) : 0,
      avgDuration
    };
  }, [executions]);

  const filteredExecutions = useMemo(() => {
    if (!keyword) {
      return executions;
    }
    return executions.filter((execution) =>
      `${execution.script_name ?? ''} ${execution.trigger_source ?? ''}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );
  }, [executions, keyword]);

  const columns: ColumnsType<Execution> = [
    {
      title: '執行識別碼',
      dataIndex: 'id',
      key: 'id',
      width: 180
    },
    {
      title: '腳本名稱',
      dataIndex: 'script_name',
      key: 'script_name',
      render: (value: Execution['script_name'], record) => value || record.script_id || '—'
    },
    {
      title: '觸發來源',
      dataIndex: 'trigger_source',
      key: 'trigger_source',
      render: (value: Execution['trigger_source']) =>
        value ? <Tag color={TRIGGER_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (value: Execution['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '開始時間',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 200,
      render: (value: Execution['start_time']) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm:ss') : '—')
    },
    {
      title: '結束時間',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 200,
      render: (value: Execution['end_time']) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm:ss') : '—')
    },
    {
      title: '耗時 (秒)',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      render: (value: Execution['duration_ms']) => (typeof value === 'number' ? (value / 1000).toFixed(1) : '—')
    },
    {
      title: '觸發人員',
      key: 'triggered_by',
      render: (_: unknown, record: Execution) =>
        record.triggered_by?.display_name || record.triggered_by?.username || '—'
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="執行日誌"
        subtitle="追蹤腳本執行歷史與耗時，便於分析自動化成效。"
        icon={<HistoryOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="執行次數"
          value={stats.total}
          unit="次"
          status="normal"
          description={`成功率 ${stats.successRate}%`}
          icon={<HistoryOutlined />}
        />
        <KpiCard
          title="平均耗時"
          value={(stats.avgDuration / 1000).toFixed(1)}
          unit="秒"
          status={stats.avgDuration > 120000 ? 'warning' : 'normal'}
          description="近期待執行的平均耗時"
          icon={<AimOutlined />}
        />
      </div>

      <SectionCard
        title="執行記錄"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋腳本或觸發來源"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 260 }}
          />
        }
      >
        <Table<Execution>
          rowKey="id"
          columns={columns}
          dataSource={filteredExecutions}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
