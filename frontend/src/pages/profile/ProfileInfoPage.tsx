import { IdcardOutlined } from '@ant-design/icons';
import { Descriptions, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useProfile } from '../../hooks';

export const ProfileInfoPage = () => {
  const { data } = useProfile();

  const stats = useMemo(() => ({ lastLogin: data?.last_login_at }), [data]);

  return (
    <PageContainer>
      <PageHeader
        title="個人資訊"
        subtitle="查看帳號資訊與所屬團隊，掌握個人作業環境。"
        icon={<IdcardOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="最後登入"
          value={stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : '尚未登入'}
          description="最近一次成功登入時間"
          status="normal"
          icon={<IdcardOutlined />}
        />
      </div>

      <SectionCard title="基本資訊">
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="顯示名稱">{data.display_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="帳號">{data.username || '—'}</Descriptions.Item>
            <Descriptions.Item label="電子郵件" span={2}>
              {data.email || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              {data.role ? <Tag color="blue">{data.role}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="語言">{data.language || '—'}</Descriptions.Item>
            <Descriptions.Item label="時區">{data.timezone || '—'}</Descriptions.Item>
            <Descriptions.Item label="所屬團隊" span={2}>
              {data.teams && data.teams.length > 0
                ? data.teams.map((team) => <Tag key={team.id}>{team.name}</Tag>)
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="建立時間">
              {data.created_at ? new Date(data.created_at).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="更新時間">
              {data.updated_at ? new Date(data.updated_at).toLocaleString() : '—'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">尚未載入個人資料。</Typography.Text>
        )}
      </SectionCard>
    </PageContainer>
  );
};
