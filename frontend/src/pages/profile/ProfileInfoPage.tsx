import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useProfile } from '../../hooks';

export const ProfileInfoPage = () => {
  const { data, loading } = useProfile();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        個人資訊
      </Typography.Title>
      <Card bordered={false} loading={loading}>
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="顯示名稱" span={1}>
              {data.display_name || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="帳號" span={1}>
              {data.username || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="電子郵件" span={2}>
              {data.email || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="角色" span={1}>
              {data.role ? <Tag color="blue">{data.role}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="語言" span={1}>
              {data.language || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="時區" span={1}>
              {data.timezone || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="所屬團隊" span={2}>
              {data.teams && data.teams.length > 0
                ? data.teams.map((team) => <Tag key={team.id}>{team.name}</Tag>)
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="建立時間" span={1}>
              {data.created_at ? new Date(data.created_at).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="更新時間" span={1}>
              {data.updated_at ? new Date(data.updated_at).toLocaleString() : '—'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">尚未載入個人資料。</Typography.Text>
        )}
      </Card>
    </Space>
  );
};
