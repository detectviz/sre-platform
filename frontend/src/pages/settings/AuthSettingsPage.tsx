import { Card, Descriptions, Space, Tag, Typography } from 'antd';
import { useAuthSettings } from '../../hooks';
import type { AuthSetting } from '../../hooks';

export const AuthSettingsPage = () => {
  const { data, loading } = useAuthSettings();
  const items = data?.items || [];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        身份驗證
      </Typography.Title>
      {items.length > 0 ? (
        items.map((setting: AuthSetting) => (
          <Card key={setting.id} bordered={false} loading={loading} title={`提供者：${setting.provider || '未設定'}`}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="OIDC 啟用" span={1}>
                {setting.oidc_enabled ? <Tag color="green">啟用</Tag> : <Tag color="red">停用</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="自動同步使用者" span={1}>
                {setting.user_sync ? <Tag color="blue">已開啟</Tag> : <Tag color="default">關閉</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Realm 名稱" span={1}>
                {setting.realm || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="用戶端 ID" span={1}>
                {setting.client_id || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="用戶端密鑰" span={1}>
                {setting.client_secret_hint || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="授權網址" span={1}>
                {setting.auth_url || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Token 端點" span={1}>
                {setting.token_url || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="使用者資訊端點" span={1}>
                {setting.userinfo_url || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="重導網址" span={1}>
                {setting.redirect_uri || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="登出網址" span={1}>
                {setting.logout_url || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="授權範圍" span={2}>
                {setting.scopes && setting.scopes.length > 0 ? (
                  setting.scopes.map((scope) => <Tag key={scope}>{scope}</Tag>)
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="建立時間" span={1}>
                {setting.created_at ? new Date(setting.created_at).toLocaleString() : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="更新時間" span={1}>
                {setting.updated_at ? new Date(setting.updated_at).toLocaleString() : '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))
      ) : (
        <Card bordered={false} loading={loading}>
          <Typography.Text type="secondary">尚未設定身份驗證整合。</Typography.Text>
        </Card>
      )}
    </Space>
  );
};
