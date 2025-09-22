import { CodeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useScripts } from '../../hooks';
import type { Script } from '../../hooks';

const SCRIPT_TYPE_COLOR: Record<string, string> = {
  shell: 'geekblue',
  python: 'cyan',
  ansible: 'orange',
  terraform: 'purple',
  powershell: 'magenta'
};

// 腳本庫頁面，方便 SRE 快速檢視自動化腳本狀態
export const ScriptLibraryPage = () => {
  const { data, loading } = useScripts();
  const [keyword, setKeyword] = useState('');
  const scripts = data?.items ?? [];

  const stats = useMemo(() => {
    const active = scripts.filter((script) => script.is_active).length;
    const automated = scripts.filter((script) => script.tags?.includes('automation')).length;
    return {
      total: scripts.length,
      active,
      automated
    };
  }, [scripts]);

  const filteredScripts = useMemo(() => {
    if (!keyword) {
      return scripts;
    }
    return scripts.filter((script) =>
      `${script.name ?? ''} ${script.description ?? ''} ${(script.tags ?? []).join(' ')}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );
  }, [keyword, scripts]);

  const columns: ColumnsType<Script> = [
    {
      title: '腳本名稱',
      dataIndex: 'name',
      key: 'name',
      render: (value: Script['name'], record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{value || '—'}</Typography.Text>
          <Typography.Text type="secondary">{record.description || '未提供說明'}</Typography.Text>
        </Space>
      )
    },
    {
      title: '腳本類型',
      dataIndex: 'type',
      key: 'type',
      render: (value: Script['type']) =>
        value ? <Tag color={SCRIPT_TYPE_COLOR[value] || 'blue'}>{value}</Tag> : '—'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (value: Script['version']) => value || '—'
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: Script['tags']) => (
        <Space size={[8, 8]} wrap>
          {(tags ?? []).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '最後執行時間',
      dataIndex: 'last_execution_at',
      key: 'last_execution_at',
      width: 200,
      render: (value: Script['last_execution_at']) => (value ? new Date(value).toLocaleString() : '—')
    },
    {
      title: '啟用狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 140,
      render: (value: Script['is_active']) =>
        value ? <Tag color="green">啟用</Tag> : <Tag color="default">停用</Tag>
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="腳本庫"
        subtitle="集中管理自動化腳本與維運工具，支援一鍵觸發。"
        icon={<CodeOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="腳本總數"
          value={stats.total}
          unit="支"
          status="normal"
          description={`啟用 ${stats.active} 支`}
          icon={<CodeOutlined />}
        />
        <KpiCard
          title="自動化標籤"
          value={stats.automated}
          unit="支"
          status={stats.automated > 0 ? 'success' : 'normal'}
          description="具備 automation 標籤的腳本"
          icon={<ThunderboltOutlined />}
        />
      </div>

      <SectionCard
        title="腳本列表"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋腳本名稱或標籤"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 260 }}
          />
        }
      >
        <Table<Script>
          rowKey="id"
          columns={columns}
          dataSource={filteredScripts}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
