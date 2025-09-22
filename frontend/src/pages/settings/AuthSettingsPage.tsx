import { SafetyCertificateOutlined } from '@ant-design/icons';
import { Descriptions, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useAuthSettings } from '../../hooks';
import type { AuthSetting } from '../../hooks';

export const AuthSettingsPage = () => {
  const { data } = useAuthSettings();
  const items = data?.items ?? [];

  const stats = useMemo(() => ({ total: items.length }), [items]);

  return (
    <PageContainer>
      <PageHeader
        title="身份驗證"
        subtitle="整合 OIDC、同步使用者資料與配置授權範圍。"
        icon={<SafetyCertificateOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="提供者數量"
          value={stats.total}
          unit="組"
          status="normal"
          description="OIDC/LDAP 等身份整合設定"
          icon={<SafetyCertificateOutlined />}
        />
      </div>

      <SectionCard title="身份驗證設定">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {items.length > 0 ? (
            items.map((setting: AuthSetting) => (
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
                  提供者：{setting.provider || '未設定'}
                </Typography.Title>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="OIDC 啟用">
                    {setting.oidc_enabled ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="自動同步使用者">
                    {setting.user_sync ? <Tag color="blue">已開啟</Tag> : <Tag color="default">關閉</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Realm 名稱">{setting.realm || '—'}</Descriptions.Item>
                  <Descriptions.Item label="用戶端 ID">{setting.client_id || '—'}</Descriptions.Item>
                  <Descriptions.Item label="用戶端密鑰">{setting.client_secret_hint || '—'}</Descriptions.Item>
                  <Descriptions.Item label="授權網址">{setting.auth_url || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Token 端點">{setting.token_url || '—'}</Descriptions.Item>
                  <Descriptions.Item label="使用者資訊端點">{setting.userinfo_url || '—'}</Descriptions.Item>
                  <Descriptions.Item label="重導網址">{setting.redirect_uri || '—'}</Descriptions.Item>
                  <Descriptions.Item label="登出網址">{setting.logout_url || '—'}</Descriptions.Item>
                  <Descriptions.Item label="授權範圍" span={2}>
                    {setting.scopes && setting.scopes.length > 0
                      ? setting.scopes.map((scope) => <Tag key={scope}>{scope}</Tag>)
                      : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="建立時間">
                    {setting.created_at ? new Date(setting.created_at).toLocaleString() : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="更新時間">
                    {setting.updated_at ? new Date(setting.updated_at).toLocaleString() : '—'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ))
          ) : (
            <Typography.Text type="secondary">尚未設定身份驗證整合。</Typography.Text>
          )}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
