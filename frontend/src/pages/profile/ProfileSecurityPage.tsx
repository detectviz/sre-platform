import { SafetyCertificateOutlined } from '@ant-design/icons';
import { Descriptions, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useProfile } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  active: 'green',
  inactive: 'orange',
  suspended: 'red'
};

export const ProfileSecurityPage = () => {
  const { data } = useProfile();

  const stats = useMemo(() => ({ status: data?.status }), [data]);

  return (
    <PageContainer>
      <PageHeader
        title="安全紀錄"
        subtitle="檢視帳號狀態與登入記錄，確保個人資訊安全。"
        icon={<SafetyCertificateOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="帳號狀態"
          value={stats.status ? (stats.status === 'active' ? '啟用中' : stats.status) : '未知'}
          status={stats.status === 'active' ? 'success' : stats.status === 'suspended' ? 'critical' : 'warning'}
          description="目前帳號可否登入平台"
          icon={<SafetyCertificateOutlined />}
        />
      </div>

      <SectionCard title="安全資訊">
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="帳號狀態">
              {data.status ? <Tag color={STATUS_COLOR[data.status] || 'default'}>{data.status}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="角色權限">
              {data.role ? <Tag color="blue">{data.role}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="最後登入時間" span={2}>
              {data.last_login_at ? new Date(data.last_login_at).toLocaleString() : '尚未登入'}
            </Descriptions.Item>
            <Descriptions.Item label="帳號建立時間">
              {data.created_at ? new Date(data.created_at).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="最後更新時間">
              {data.updated_at ? new Date(data.updated_at).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="所屬團隊" span={2}>
              {data.teams && data.teams.length > 0
                ? data.teams.map((team) => <Tag key={team.id}>{team.name}</Tag>)
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="通知信箱" span={2}>
              {data.email || '—'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">尚未載入安全資訊。</Typography.Text>
        )}
      </SectionCard>
    </PageContainer>
  );
};
