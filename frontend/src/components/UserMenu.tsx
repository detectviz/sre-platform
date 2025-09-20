import { LogoutOutlined, QuestionCircleOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Space, Typography, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

export type UserMenuProps = {
  onHelp?: () => void;
  extraItems?: MenuProps['items'];
  avatar?: ReactNode;
};

export const UserMenu = ({
  onHelp,
  extraItems,
  avatar,
}: UserMenuProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null; // 如果沒有使用者資訊，不渲染選單
  }

  const handleLogout = () => {
    logout();
    message.success('已成功登出');
    navigate('/login');
  };

  const handleProfile = () => {
    // 導航到個人資料頁，暫時先用 console.log
    console.log('Navigate to profile');
    // navigate('/profile');
  };

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      type: 'group',
      label: (
        <div style={{ padding: '8px 12px' }}>
          <Text strong style={{ color: 'var(--text-primary)' }}>{user.name}</Text>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{user.email}</div>
        </div>
      ),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: handleProfile,
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
      onClick: handleLogout,
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
            <Text style={{ color: 'var(--text-primary)' }}>{user.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Text>
          </Space>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserMenu;
