import { NodeIndexOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Col, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useTopologies } from '../../hooks';
import type { TopologyView } from '../../hooks';

export const TopologyPage = () => {
  const { data, loading } = useTopologies();
  const topology = data?.items?.[0];

  const stats = useMemo(() => {
    if (!topology) {
      return { nodeCount: 0, edgeCount: 0, updated: '-' };
    }
    return {
      nodeCount: topology.nodes?.length ?? 0,
      edgeCount: topology.edges?.length ?? 0,
      updated: topology.updated_at ? new Date(topology.updated_at).toLocaleString() : '—'
    };
  }, [topology]);

  const nodeColumns: ColumnsType<NonNullable<TopologyView['nodes']>[number]> = [
    { title: '節點名稱', dataIndex: 'name', key: 'name' },
    { title: '類型', dataIndex: 'type', key: 'type', render: (value) => <Tag>{value}</Tag> },
    { title: '環境', dataIndex: 'environment', key: 'environment', render: (value) => value || '—' },
    { title: '狀態', dataIndex: 'status', key: 'status', render: (value) => <Tag color={value === 'healthy' ? 'green' : value === 'warning' ? 'gold' : 'red'}>{value}</Tag> },
    { title: '團隊', dataIndex: 'team', key: 'team', render: (value) => value || '—' }
  ];

  const edgeColumns: ColumnsType<NonNullable<TopologyView['edges']>[number]> = [
    { title: '來源節點', dataIndex: 'source_id', key: 'source_id' },
    { title: '目標節點', dataIndex: 'target_id', key: 'target_id' },
    { title: '連線類型', dataIndex: 'connection_type', key: 'connection_type' },
    {
      title: '延遲 (ms)',
      dataIndex: 'latency_ms',
      key: 'latency_ms',
      render: (value) => (typeof value === 'number' ? value.toFixed(0) : '—')
    },
    {
      title: '頻寬 (Mbps)',
      dataIndex: 'throughput_mbps',
      key: 'throughput_mbps',
      render: (value) => (typeof value === 'number' ? value.toFixed(0) : '—')
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="拓撲視圖"
        subtitle="檢視服務節點與依賴關係，掌握跨系統連結品質。"
        icon={<ShareAltOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="節點數量"
          value={stats.nodeCount}
          unit="個"
          status="normal"
          description="涵蓋 API、服務與資料庫等核心元件"
          icon={<NodeIndexOutlined />}
        />
        <KpiCard
          title="連線數量"
          value={stats.edgeCount}
          unit="條"
          status="normal"
          description="跨節點資料流與依賴連線"
          icon={<ShareAltOutlined />}
        />
        <KpiCard
          title="最近同步"
          value={stats.updated}
          unit=""
          status="normal"
          description="拓撲資料來源快照時間"
          icon={<ShareAltOutlined />}
        />
      </div>

      <SectionCard title={topology?.name || '拓撲'}>
        <Typography.Paragraph type="secondary">{topology?.description || '尚未提供拓撲描述。'}</Typography.Paragraph>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                節點明細
              </Typography.Title>
              <Table
                rowKey="id"
                columns={nodeColumns}
                dataSource={topology?.nodes || []}
                loading={loading}
                pagination={false}
                size="small"
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                連線明細
              </Typography.Title>
              <Table
                rowKey={(record) => `${record.source_id}-${record.target_id}`}
                columns={edgeColumns}
                dataSource={topology?.edges || []}
                loading={loading}
                pagination={false}
                size="small"
              />
            </div>
          </Col>
        </Row>
      </SectionCard>
    </PageContainer>
  );
};
