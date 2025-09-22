import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useProfile } from '../../hooks';

const STATUS_COLOR: Record<string, string> = {
  active: 'green',
  inactive: 'orange',
  suspended: 'red'
};

export const ProfileSecurityPage = () => {
  const { data, loading } = useProfile();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        安全紀錄
      </Typography.Title>
      <Card bordered={false} loading={loading}>
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="帳號狀態" span={1}>
              {data.status ? <Tag color={STATUS_COLOR[data.status] || 'default'}>{data.status}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="角色權限" span={1}>
              {data.role ? <Tag color="blue">{data.role}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="最後登入時間" span={2}>
              {data.last_login_at ? new Date(data.last_login_at).toLocaleString() : '尚未登入'}
            </Descriptions.Item>
            <Descriptions.Item label="帳號建立時間" span={1}>
              {data.created_at ? new Date(data.created_at).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="最後更新時間" span={1}>
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
      </Card>
    </Space>
  );
};
