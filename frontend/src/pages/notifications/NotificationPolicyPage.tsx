import { BellOutlined, NotificationOutlined } from '@ant-design/icons';
import { Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useNotificationPolicies } from '../../hooks';
import type { NotificationPolicy } from '../../hooks';

export const NotificationPolicyPage = () => {
  const { data, loading } = useNotificationPolicies();
  const policies = data?.items ?? [];

  const stats = useMemo(() => {
    const enabled = policies.filter((policy) => policy.enabled).length;
    return {
      total: policies.length,
      enabled
    };
  }, [policies]);

  return (
    <PageContainer>
      <PageHeader
        title="通知策略"
        subtitle="設定事件通知的優先級、管道與對象，確保關鍵事件即時通知。"
        icon={<NotificationOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="策略數量"
          value={stats.total}
          unit="項"
          status="normal"
          description={`啟用 ${stats.enabled} 項`}
          icon={<BellOutlined />}
        />
      </div>

      <SectionCard title="策略清單">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {policies.map((policy: NotificationPolicy) => (
            <div
              key={policy.id}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {policy.name}
                    </Typography.Title>
                    <Typography.Text type="secondary">{policy.description}</Typography.Text>
                  </div>
                  <Tag color={policy.enabled ? 'green' : 'default'} bordered={false}>
                    {policy.enabled ? '啟用' : '停用'}
                  </Tag>
                </div>

                <Space size={[8, 8]} wrap>
                  <Tag color="magenta" bordered={false}>
                    優先級：{policy.priority?.toUpperCase()}
                  </Tag>
                  {(policy.severity_filters ?? []).map((severity) => (
                    <Tag key={severity} color="volcano" bordered={false}>
                      {severity}
                    </Tag>
                  ))}
                </Space>

                <div>
                  <Typography.Text style={{ color: 'var(--text-tertiary)' }}>通知管道</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {(policy.channel_ids ?? []).length > 0
                      ? (policy.channel_ids ?? []).join('、')
                      : '尚未綁定管道'}
                  </Typography.Paragraph>
                </div>

                <div>
                  <Typography.Text style={{ color: 'var(--text-tertiary)' }}>接收對象</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {(policy.recipients ?? []).length > 0
                      ? (policy.recipients ?? [])
                          .map((recipient) => recipient.display_name || recipient.id || '未知對象')
                          .join('、')
                      : '未設定'}
                  </Typography.Paragraph>
                </div>

                <Typography.Text type="secondary">
                  更新時間：{policy.updated_at ? new Date(policy.updated_at).toLocaleString() : '—'}
                </Typography.Text>
              </Space>
            </div>
          ))}

          {!loading && policies.length === 0 ? (
            <Typography.Text type="secondary">尚未建立任何通知策略。</Typography.Text>
          ) : null}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
