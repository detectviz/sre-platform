import { ApartmentOutlined, TeamOutlined } from '@ant-design/icons';
import { Col, Progress, Row, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useResourceGroups } from '../../hooks';
import type { ResourceGroup } from '../../hooks';

// 資源群組頁面，聚焦於群組的健康狀態與成員資訊
export const ResourceGroupPage = () => {
  const { data, loading } = useResourceGroups();
  const groups = data?.items ?? [];

  const stats = useMemo(() => {
    const totalMembers = groups.reduce((sum, group) => sum + (group.member_count ?? 0), 0);
    const totalResources = groups.reduce((sum, group) => sum + (group.resource_ids?.length ?? 0), 0);
    const groupsAtRisk = groups.filter((group) => (group.status_summary?.critical ?? 0) > 0).length;
    return {
      total: groups.length,
      members: totalMembers,
      resources: totalResources,
      atRisk: groupsAtRisk
    };
  }, [groups]);

  return (
    <PageContainer>
      <PageHeader
        title="資源群組"
        subtitle="盤點服務群組健康概況，掌握跨團隊負載與告警狀態。"
        icon={<ApartmentOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="群組總數"
          value={stats.total}
          unit="個"
          status="normal"
          description={`影響資源 ${stats.resources} 項`}
          icon={<ApartmentOutlined />}
        />
        <KpiCard
          title="成員總數"
          value={stats.members}
          unit="人"
          status="normal"
          description="跨團隊協同人力"
          icon={<TeamOutlined />}
        />
        <KpiCard
          title="需要關注"
          value={stats.atRisk}
          unit="個"
          status={stats.atRisk > 0 ? 'warning' : 'normal'}
          description="含有 Critical 資源的群組"
          icon={<TeamOutlined />}
        />
      </div>

      <SectionCard title="群組詳情">
        <Row gutter={[16, 16]}>
          {groups.map((group: ResourceGroup) => (
            <Col xs={24} md={12} key={group.id || group.name}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {group.name || '未命名群組'}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {group.description || '暫無描述'}
                      </Typography.Paragraph>
                    </div>
                    <Tag color="geekblue" bordered={false}>
                      {group.owner_team || '未指定團隊'}
                    </Tag>
                  </div>

                  <Space size={[12, 8]} wrap>
                    <Tag color="blue" bordered={false}>
                      資源 {group.resource_ids?.length ?? 0} 項
                    </Tag>
                    <Tag color="purple" bordered={false}>
                      成員 {group.member_count ?? 0} 人
                    </Tag>
                    <Tag color="cyan" bordered={false}>
                      訂閱 {group.subscriber_count ?? 0} 人
                    </Tag>
                  </Space>

                  <div>
                    <Typography.Text style={{ color: 'var(--text-tertiary)' }}>健康指標</Typography.Text>
                    <Space size="large" wrap style={{ marginTop: 8 }}>
                      <div style={{ minWidth: 120 }}>
                        <Typography.Text type="secondary">健康</Typography.Text>
                        <Progress
                          percent={Math.round(
                            (group.status_summary?.healthy ?? 0) /
                              Math.max(1, (group.status_summary?.healthy ?? 0) + (group.status_summary?.warning ?? 0) + (group.status_summary?.critical ?? 0)) *
                              100
                          )}
                          strokeColor="#52c41a"
                          showInfo={false}
                        />
                      </div>
                      <div style={{ minWidth: 120 }}>
                        <Typography.Text type="secondary">警示</Typography.Text>
                        <Progress
                          percent={Math.round(
                            (group.status_summary?.warning ?? 0) /
                              Math.max(1, (group.status_summary?.healthy ?? 0) + (group.status_summary?.warning ?? 0) + (group.status_summary?.critical ?? 0)) *
                              100
                          )}
                          strokeColor="#faad14"
                          showInfo={false}
                        />
                      </div>
                      <div style={{ minWidth: 120 }}>
                        <Typography.Text type="secondary">嚴重</Typography.Text>
                        <Progress
                          percent={Math.round(
                            (group.status_summary?.critical ?? 0) /
                              Math.max(1, (group.status_summary?.healthy ?? 0) + (group.status_summary?.warning ?? 0) + (group.status_summary?.critical ?? 0)) *
                              100
                          )}
                          strokeColor="#ff4d4f"
                          showInfo={false}
                        />
                      </div>
                    </Space>
                  </div>

                  <Typography.Text type="secondary">
                    最後更新：{group.updated_at ? new Date(group.updated_at).toLocaleString() : '—'}
                  </Typography.Text>
                </Space>
              </div>
            </Col>
          ))}

          {!loading && groups.length === 0 ? (
            <Col span={24}>
              <Typography.Text type="secondary">尚未建立任何資源群組。</Typography.Text>
            </Col>
          ) : null}
        </Row>
      </SectionCard>
    </PageContainer>
  );
};
