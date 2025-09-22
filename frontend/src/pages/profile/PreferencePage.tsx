import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { usePreferences } from '../../hooks';

const renderBooleanTag = (value: boolean | undefined, enabledLabel: string, disabledLabel: string) =>
  value ? <Tag color="green">{enabledLabel}</Tag> : <Tag color="default">{disabledLabel}</Tag>;

export const PreferencePage = () => {
  const { data, loading } = usePreferences();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        偏好設定
      </Typography.Title>
      <Card bordered={false} loading={loading}>
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="主題" span={1}>
              {data.theme || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="預設頁面" span={1}>
              {data.default_page || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="語言" span={1}>
              {data.language || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="時區" span={1}>
              {data.timezone || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="電子郵件通知" span={1}>
              {renderBooleanTag(data.notification_preferences?.email_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="Slack 通知" span={1}>
              {renderBooleanTag(data.notification_preferences?.slack_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="合併通知" span={1}>
              {renderBooleanTag(data.notification_preferences?.merge_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="動畫效果" span={1}>
              {renderBooleanTag(data.display_options?.animation, '顯示', '關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="工具提示" span={1}>
              {renderBooleanTag(data.display_options?.tooltips, '顯示', '關閉')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">尚未載入偏好設定。</Typography.Text>
        )}
      </Card>
    </Space>
  );
};
