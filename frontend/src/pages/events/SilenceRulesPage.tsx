import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useSilences } from '../../hooks';

export const SilenceRulesPage = () => {
  const { data, loading } = useSilences();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        靜音規則
      </Typography.Title>
      {data?.items?.map((silence) => (
        <Card key={silence.id} loading={loading} title={silence.name} bordered={false}>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="靜音類型">{silence.silence_type}</Descriptions.Item>
            <Descriptions.Item label="範圍">{silence.scope}</Descriptions.Item>
            <Descriptions.Item label="匹配條件" span={2}>
              {silence.matchers?.map((matcher) => (
                <Tag key={`${matcher.key}-${matcher.value}`}>{`${matcher.key} ${matcher.operator} ${matcher.value}`}</Tag>
              )) || '未設定'}
            </Descriptions.Item>
            <Descriptions.Item label="靜音時間" span={2}>
              {`${silence.start_time} ~ ${silence.end_time}`} ({silence.timezone})
            </Descriptions.Item>
            <Descriptions.Item label="是否啟用">{silence.is_enabled ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="通知設定">
              {silence.notify_on_start || silence.notify_on_end
                ? [
                    silence.notify_on_start ? '開始通知' : null,
                    silence.notify_on_end ? '結束通知' : null
                  ]
                    .filter((value): value is string => Boolean(value))
                    .join('、')
                : '無'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ))}
    </Space>
  );
};
