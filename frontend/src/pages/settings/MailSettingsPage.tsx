import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useMailSettings } from '../../hooks';
import type { MailSetting } from '../../hooks';

export const MailSettingsPage = () => {
  const { data, loading } = useMailSettings();
  const items = data?.items || [];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        郵件設定
      </Typography.Title>
      {items.length > 0 ? (
        items.map((setting: MailSetting) => (
          <Card key={setting.id} bordered={false} loading={loading} title={`SMTP：${setting.smtp_host}:${setting.smtp_port}`}> 
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="加密方式" span={1}>
                {setting.encryption ? <Tag color="geekblue">{setting.encryption}</Tag> : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="帳號名稱" span={1}>
                {setting.username || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="寄件者" span={1}>
                {setting.sender_name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="寄件地址" span={1}>
                {setting.sender_email || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="回覆地址" span={1}>
                {setting.reply_to || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="測試收件者" span={1}>
                {setting.test_recipient || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="啟用狀態" span={1}>
                {setting.is_enabled ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="最後更新人" span={1}>
                {setting.updated_by?.display_name || setting.updated_by?.username || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="最後更新時間" span={2}>
                {setting.updated_at ? new Date(setting.updated_at).toLocaleString() : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))
      ) : (
        <Card bordered={false} loading={loading}>
          <Typography.Text type="secondary">尚未設定郵件服務。</Typography.Text>
        </Card>
      )}
    </Space>
  );
};
