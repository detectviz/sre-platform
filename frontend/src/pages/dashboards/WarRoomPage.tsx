import { AlertOutlined, TeamOutlined } from '@ant-design/icons';
import { Space, Tag, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useWarRoomDashboards } from '../../hooks';
import type { WarRoom } from '../../hooks';

export const WarRoomPage = () => {
  const { data } = useWarRoomDashboards();
  const warRoom = (data?.items ?? [])[0] as WarRoom | undefined;

  const stats = useMemo(() => {
    if (!warRoom) {
      return { incidents: 0, participants: 0, status: 'inactive' };
    }
    return {
      incidents: warRoom.incident_ids?.length ?? 0,
      participants: warRoom.participants?.length ?? 0,
      status: warRoom.status ?? 'inactive'
    };
  }, [warRoom]);

  return (
    <PageContainer>
      <PageHeader
        title="戰情室"
        subtitle="快速協調跨團隊資源，聚焦處理高優先度事件。"
        icon={<AlertOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="關注事件"
          value={stats.incidents}
          unit="件"
          status={stats.incidents > 0 ? 'critical' : 'normal'}
          description="當前戰情室追蹤的事件"
          icon={<AlertOutlined />}
        />
        <KpiCard
          title="參與人員"
          value={stats.participants}
          unit="人"
          status="normal"
          description="跨團隊協同處理"
          icon={<TeamOutlined />}
        />
        <KpiCard
          title="戰情狀態"
          value={warRoom?.status === 'active' ? '進行中' : '已結束'}
          description={warRoom?.notes ?? '未提供備註'}
          status={warRoom?.status === 'active' ? 'warning' : 'success'}
          icon={<AlertOutlined />}
        />
      </div>

      <SectionCard title={warRoom?.title || '戰情室'}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Typography.Paragraph type="secondary">{warRoom?.description || '尚未提供戰情室描述。'}</Typography.Paragraph>

          <div>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              關聯事件
            </Typography.Title>
            <Space size={[8, 8]} wrap>
              {(warRoom?.incident_ids ?? []).map((incidentId) => (
                <Tag key={incidentId} color="magenta" bordered={false}>
                  {incidentId}
                </Tag>
              ))}
            </Space>
          </div>

          <div>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              參與成員
            </Typography.Title>
            <Space size={[8, 8]} wrap>
              {(warRoom?.participants ?? []).map((participant) => (
                <Tag key={participant.id} color="blue" bordered={false}>
                  {participant.display_name || participant.username}
                </Tag>
              ))}
            </Space>
          </div>

          <div>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              行動時間軸
            </Typography.Title>
            <Timeline
              items={(warRoom?.timeline ?? []).map((entry) => ({
                children: (
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>{entry.description}</Typography.Text>
                    <Typography.Text type="secondary">
                      {entry.timestamp ? dayjs(entry.timestamp).format('YYYY/MM/DD HH:mm:ss') : '—'} ·{' '}
                      {entry.actor?.display_name || entry.actor?.username || '系統'}
                    </Typography.Text>
                  </Space>
                )
              }))}
            />
          </div>

          <Typography.Text type="secondary">
            建立時間：{warRoom?.started_at ? dayjs(warRoom.started_at).format('YYYY/MM/DD HH:mm') : '—'}
          </Typography.Text>
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
