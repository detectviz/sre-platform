import { MailOutlined } from '@ant-design/icons';
import { Descriptions, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useMailSettings } from '../../hooks';
import type { MailSetting } from '../../hooks';

export const MailSettingsPage = () => {
  const { data } = useMailSettings();
  const items = data?.items ?? [];

  const stats = useMemo(() => ({ total: items.length }), [items]);

  return (
    <PageContainer>
      <PageHeader
        title="郵件設定"
        subtitle="維護 SMTP 設定與測試收件者，確保通知可順利寄送。"
        icon={<MailOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="SMTP 設定"
          value={stats.total}
          unit="組"
          status="normal"
          description="每組包含寄件資訊與測試收件者"
          icon={<MailOutlined />}
        />
      </div>

      <SectionCard title="郵件服務">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {items.length > 0 ? (
            items.map((setting: MailSetting) => (
              <div
                key={setting.id}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  SMTP：{setting.smtp_host}:{setting.smtp_port}
                </Typography.Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="加密方式">
                    {setting.encryption ? <Tag color="geekblue">{setting.encryption}</Tag> : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="帳號名稱">{setting.username || '—'}</Descriptions.Item>
                  <Descriptions.Item label="寄件者">{setting.sender_name || '—'}</Descriptions.Item>
                  <Descriptions.Item label="寄件地址">{setting.sender_email || '—'}</Descriptions.Item>
                  <Descriptions.Item label="回覆地址">{setting.reply_to || '—'}</Descriptions.Item>
                  <Descriptions.Item label="測試收件者">{setting.test_recipient || '—'}</Descriptions.Item>
                  <Descriptions.Item label="啟用狀態">
                    {setting.is_enabled ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="最後更新人">
                    {setting.updated_by?.display_name || setting.updated_by?.username || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="最後更新時間" span={2}>
                    {setting.updated_at ? new Date(setting.updated_at).toLocaleString() : '—'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ))
          ) : (
            <Typography.Text type="secondary">尚未設定郵件服務。</Typography.Text>
          )}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
