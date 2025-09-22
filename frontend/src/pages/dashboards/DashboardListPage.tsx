import { BarChartOutlined, FundProjectionScreenOutlined, StarFilled } from '@ant-design/icons';
import { Col, Row, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useDashboards } from '../../hooks';
import type { Dashboard } from '../../hooks';

export const DashboardListPage = () => {
  const { data, loading } = useDashboards();
  const dashboards = data?.items ?? [];

  const stats = useMemo(() => {
    const published = dashboards.filter((item) => item.is_published).length;
    const defaultDashboards = dashboards.filter((item) => item.is_default).length;
    return {
      total: dashboards.length,
      published,
      defaultDashboards
    };
  }, [dashboards]);

  return (
    <PageContainer>
      <PageHeader
        title="儀表板列表"
        subtitle="集中管理作戰儀表板，快速切換監控視角。"
        icon={<FundProjectionScreenOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="儀表板總數"
          value={stats.total}
          unit="個"
          status="normal"
          description={`已發布 ${stats.published} 個`}
          icon={<BarChartOutlined />}
        />
        <KpiCard
          title="預設儀表板"
          value={stats.defaultDashboards}
          unit="個"
          status={stats.defaultDashboards > 0 ? 'success' : 'normal'}
          description="登入後快速導引頁面"
          icon={<StarFilled style={{ color: '#faad14' }} />}
        />
      </div>

      <SectionCard title="儀表板清單">
        <Row gutter={[16, 16]}>
          {dashboards.map((dashboard: Dashboard) => (
            <Col xs={24} md={12} key={dashboard.id}>
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  height: '100%'
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {dashboard.name}
                      </Typography.Title>
                      <Typography.Text type="secondary">{dashboard.description}</Typography.Text>
                    </div>
                    <Space size={[8, 8]} wrap>
                      <Tag color="blue" bordered={false}>
                        {dashboard.category}
                      </Tag>
                      {dashboard.is_default ? (
                        <Tag color="gold" bordered={false} icon={<StarFilled />}>預設</Tag>
                      ) : null}
                      {dashboard.is_published ? <Tag color="green" bordered={false}>已發布</Tag> : <Tag color="default">草稿</Tag>}
                    </Space>
                  </div>

                  <Space size={[8, 8]} wrap>
                    {(dashboard.tags ?? []).map((tag) => (
                      <Tag key={`${dashboard.id}-${tag}`} bordered={false}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                    {dashboard.kpi_summary ? (
                      Object.entries(dashboard.kpi_summary).map(([key, value]) => (
                        <div key={key}>
                          <Typography.Text style={{ color: 'var(--text-tertiary)' }}>{key}</Typography.Text>
                          <Typography.Title level={4} style={{ margin: '4px 0 0 0' }}>
                            {typeof value === 'number' ? value : JSON.stringify(value)}
                          </Typography.Title>
                        </div>
                      ))
                    ) : (
                      <Typography.Text type="secondary">尚未設定 KPI 數據。</Typography.Text>
                    )}
                  </div>

                  <Typography.Text type="secondary">
                    更新時間：{dashboard.updated_at ? new Date(dashboard.updated_at).toLocaleString() : '—'}
                  </Typography.Text>
                </Space>
              </div>
            </Col>
          ))}

          {!loading && dashboards.length === 0 ? (
            <Col span={24}>
              <Typography.Text type="secondary">尚未建立任何儀表板。</Typography.Text>
            </Col>
          ) : null}
        </Row>
      </SectionCard>
    </PageContainer>
  );
};
