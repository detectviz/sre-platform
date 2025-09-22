import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useSchedules } from '../../hooks';
import type { Schedule } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  enabled: 'green',
  disabled: 'default',
  paused: 'orange'
};

const TYPE_COLOR: Record<string, string> = {
  one_time: 'geekblue',
  recurring: 'purple',
  event_driven: 'cyan'
};

// 排程管理頁面，顯示自動化腳本的排程與觸發資訊
export const SchedulePage = () => {
  const { data, loading } = useSchedules();
  const [keyword, setKeyword] = useState('');
  const schedules = data?.items ?? [];

  const stats = useMemo(() => {
    const enabled = schedules.filter((schedule) => schedule.status === 'enabled').length;
    const upcoming = schedules.filter((schedule) =>
      schedule.next_run_time ? dayjs(schedule.next_run_time).isAfter(dayjs()) : false
    ).length;
    return {
      total: schedules.length,
      enabled,
      upcoming
    };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    if (!keyword) {
      return schedules;
    }
    return schedules.filter((schedule) =>
      `${schedule.name ?? ''} ${schedule.script_name ?? ''}`.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [keyword, schedules]);

  const columns: ColumnsType<Schedule> = [
    {
      title: '排程名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: Schedule['name'], record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{value || '—'}</Typography.Text>
          <Typography.Text type="secondary">腳本：{record.script_name || record.script_id}</Typography.Text>
        </Space>
      )
    },
    {
      title: '排程類型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (value: Schedule['type']) =>
        value ? <Tag color={TYPE_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '下一次執行',
      dataIndex: 'next_run_time',
      key: 'next_run_time',
      width: 200,
      render: (value: Schedule['next_run_time']) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—')
    },
    {
      title: '最後執行',
      dataIndex: 'last_run_time',
      key: 'last_run_time',
      width: 200,
      render: (value: Schedule['last_run_time']) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—')
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value: Schedule['status']) =>
        value ? <Tag color={STATUS_COLOR[value] || 'default'}>{value}</Tag> : '—'
    },
    {
      title: '併發策略',
      dataIndex: 'concurrency_policy',
      key: 'concurrency_policy',
      render: (value: Schedule['concurrency_policy']) => value || '—'
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="排程管理"
        subtitle="檢視自動化排程狀態與下一次執行時間。"
        icon={<CalendarOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="排程總數"
          value={stats.total}
          unit="項"
          status="normal"
          description={`啟用 ${stats.enabled} 項`}
          icon={<CalendarOutlined />}
        />
        <KpiCard
          title="即將執行"
          value={stats.upcoming}
          unit="項"
          status={stats.upcoming > 0 ? 'warning' : 'normal'}
          description="24 小時內排程"
          icon={<ClockCircleOutlined />}
        />
      </div>

      <SectionCard
        title="排程清單"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋排程或腳本"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 240 }}
          />
        }
      >
        <Table<Schedule>
          rowKey="id"
          columns={columns}
          dataSource={filteredSchedules}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
