import { BulbOutlined, LineChartOutlined } from '@ant-design/icons';
import { List, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useInsights } from '../../hooks';
import type { Insight } from '../../hooks';

export const InsightPage = () => {
  const { data, loading } = useInsights();
  const insights = data?.items ?? [];

  const stats = useMemo(() => ({ count: insights.length }), [insights]);

  return (
    <PageContainer>
      <PageHeader
        title="洞察儀表板"
        subtitle="蒐集容量、效能與成本趨勢，提供決策建議。"
        icon={<BulbOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="洞察報告"
          value={stats.count}
          unit="份"
          status="normal"
          description="AI 分析與最佳化建議"
          icon={<LineChartOutlined />}
        />
      </div>

      <SectionCard title="最新洞察">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {insights.map((insight: Insight) => (
            <div
              key={insight.id}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {insight.title}
                    </Typography.Title>
                    <Typography.Text type="secondary">{insight.summary}</Typography.Text>
                  </div>
                  <Tag color="blue" bordered={false}>
                    {insight.category}
                  </Tag>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  {(insight.metrics ?? []).map((metric) => (
                    <div key={`${insight.id}-${metric.name}`}>
                      <Typography.Text style={{ color: 'var(--text-tertiary)' }}>{metric.name}</Typography.Text>
                      <Typography.Title level={4} style={{ margin: '4px 0 0 0' }}>
                        {metric.current_value}
                      </Typography.Title>
                      <Typography.Text type="secondary">基準：{metric.baseline_value}</Typography.Text>
                    </div>
                  ))}
                </div>

                <List
                  bordered={false}
                  loading={loading}
                  dataSource={insight.recommendations ?? []}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.title}
                        description={item.description}
                      />
                      <Tag color="gold" bordered={false}>
                        優先順序：{item.priority?.toUpperCase()}
                      </Tag>
                    </List.Item>
                  )}
                />

                <Typography.Text type="secondary">
                  產生時間：{insight.generated_at ? new Date(insight.generated_at).toLocaleString() : '—'}
                </Typography.Text>
              </Space>
            </div>
          ))}

          {!loading && insights.length === 0 ? (
            <Typography.Text type="secondary">目前尚未產出洞察報告。</Typography.Text>
          ) : null}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
