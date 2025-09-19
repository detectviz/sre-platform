import { LogoutOutlined, QuestionCircleOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export type UserMenuProps = {
  username: string;
  email: string;
  onProfile?: () => void;
  onHelp?: () => void;
  onLogout?: () => void;
  extraItems?: MenuProps['items'];
  avatar?: ReactNode;
};

export const UserMenu = ({
  username,
  email,
  onProfile,
  onHelp,
  onLogout,
  extraItems,
  avatar,
}: UserMenuProps) => {
  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div style={{ padding: '8px 12px' }}>
          <Text strong style={{ color: 'var(--text-primary)' }}>{username}</Text>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{email}</div>
        </div>
      ),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: onProfile,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '偏好設定',
      disabled: true,
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: '幫助中心',
      onClick: onHelp,
    },
    { type: 'divider' },
    ...(extraItems || []),
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: 'var(--brand-danger)' }} />,
      label: <span style={{ color: 'var(--brand-danger)' }}>登出</span>,
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button type="text" className="user-menu__trigger">
        <Space size={8}>
          {avatar ?? (
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            />
          )}
          <Space direction="vertical" size={0} align="start">
            <Text style={{ color: 'var(--text-primary)' }}>{username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {email}
            </Text>
          </Space>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserMenu;
