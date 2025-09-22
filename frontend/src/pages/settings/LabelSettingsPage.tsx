import { TagOutlined } from '@ant-design/icons';
import { Input, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useLabels } from '../../hooks';
import type { Label } from '../../hooks';

export const LabelSettingsPage = () => {
  const { data, loading } = useLabels();
  const [keyword, setKeyword] = useState('');
  const labels = data?.items ?? [];

  const stats = useMemo(() => ({ total: labels.length }), [labels]);

  const filteredLabels = useMemo(() => {
    if (!keyword) {
      return labels;
    }
    return labels.filter((label) =>
      `${label.key ?? ''} ${label.value ?? ''} ${label.category ?? ''}`
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );
  }, [labels, keyword]);

  const columns: ColumnsType<Label> = [
    { title: '標籤鍵', dataIndex: 'key', key: 'key' },
    { title: '標籤值', dataIndex: 'value', key: 'value' },
    {
      title: '分類',
      dataIndex: 'category',
      key: 'category',
      render: (value: Label['category']) => value || '—'
    },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      render: (value: Label['color']) =>
        value ? (
          <Tag color={value} style={{ color: '#fff' }}>
            {value}
          </Tag>
        ) : (
          '—'
        )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (value: Label['description']) => value || '—'
    },
    {
      title: '標籤來源',
      dataIndex: 'is_system',
      key: 'is_system',
      render: (value: Label['is_system']) => (value ? <Tag color="purple">系統內建</Tag> : <Tag color="green">自訂</Tag>)
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="標籤管理"
        subtitle="設定資源標籤與分類，支援事件與報表篩選。"
        icon={<TagOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="標籤總數"
          value={stats.total}
          unit="個"
          status="normal"
          description="包含系統預設與自訂"
          icon={<TagOutlined />}
        />
      </div>

      <SectionCard
        title="標籤列表"
        extra={
          <Input.Search
            allowClear
            placeholder="搜尋標籤鍵或值"
            onSearch={(value) => setKeyword(value)}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 260 }}
          />
        }
      >
        <Table<Label>
          rowKey="id"
          columns={columns}
          dataSource={filteredLabels}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </SectionCard>
    </PageContainer>
  );
};
