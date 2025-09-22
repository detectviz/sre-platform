import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useNotificationPolicies } from '../../hooks';

export const NotificationPolicyPage = () => {
  const { data, loading } = useNotificationPolicies();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        通知策略
      </Typography.Title>
      {data?.items?.map((policy) => (
        <Card key={policy.id} loading={loading} title={policy.name} bordered={false}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="狀態">{policy.enabled ? '啟用' : '停用'}</Descriptions.Item>
            <Descriptions.Item label="優先級">{policy.priority}</Descriptions.Item>
            <Descriptions.Item label="嚴重性" span={2}>
              <Space wrap>
                {policy.severity_filters?.map((severity) => (
                  <Tag key={severity}>{severity}</Tag>
                )) || '未設定'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="通知管道" span={2}>
              {policy.channel_ids?.join('、') || '未設定'}
            </Descriptions.Item>
            <Descriptions.Item label="接收者" span={2}>
              {policy.recipients && policy.recipients.length > 0
                ? policy.recipients.map((recipient) => recipient.display_name || recipient.id).join('、')
                : '未設定'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ))}
    </Space>
  );
};
