import { SettingOutlined } from '@ant-design/icons';
import { Descriptions, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { usePreferences } from '../../hooks';

const renderBooleanTag = (value: boolean | undefined, enabledLabel: string, disabledLabel: string) =>
  value ? <Tag color="green">{enabledLabel}</Tag> : <Tag color="default">{disabledLabel}</Tag>;

export const PreferencePage = () => {
  const { data } = usePreferences();

  const stats = useMemo(() => ({ theme: data?.theme }), [data]);

  return (
    <PageContainer>
      <PageHeader
        title="偏好設定"
        subtitle="設定主題、預設頁面與通知偏好，打造個人化體驗。"
        icon={<SettingOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="主題模式"
          value={stats.theme ? stats.theme.toUpperCase() : '未設定'}
          status="normal"
          description="目前選用的界面主題"
          icon={<SettingOutlined />}
        />
      </div>

      <SectionCard title="通知與顯示偏好">
        {data ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="主題">{data.theme || '—'}</Descriptions.Item>
            <Descriptions.Item label="預設頁面">{data.default_page || '—'}</Descriptions.Item>
            <Descriptions.Item label="語言">{data.language || '—'}</Descriptions.Item>
            <Descriptions.Item label="時區">{data.timezone || '—'}</Descriptions.Item>
            <Descriptions.Item label="電子郵件通知">
              {renderBooleanTag(data.notification_preferences?.email_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="Slack 通知">
              {renderBooleanTag(data.notification_preferences?.slack_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="合併通知">
              {renderBooleanTag(data.notification_preferences?.merge_notification, '已啟用', '已關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="動畫效果">
              {renderBooleanTag(data.display_options?.animation, '顯示', '關閉')}
            </Descriptions.Item>
            <Descriptions.Item label="工具提示">
              {renderBooleanTag(data.display_options?.tooltips, '顯示', '關閉')}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text type="secondary">尚未載入偏好設定。</Typography.Text>
        )}
      </SectionCard>
    </PageContainer>
  );
};
