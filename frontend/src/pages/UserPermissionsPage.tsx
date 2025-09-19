import { useMemo } from 'react';
import {
  ApartmentOutlined,
  AuditOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Col, Row, Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import fallbackData from '../mocks/db.json';
import { ContextualKPICard, DataTable, PageHeader } from '../components';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status?: string;
  loginCount?: number;
};

type TeamRecord = {
  id: string;
  name: string;
  description?: string;
};

type RoleRecord = {
  id: string;
  name: string;
  description?: string;
};

const users: UserRecord[] = (fallbackData.users ?? []).map((user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  loginCount: user.loginCount,
}));

const teams: TeamRecord[] = (fallbackData.teams ?? []).map((team: any) => ({
  id: team.id,
  name: team.name,
  description: team.description,
}));

const roles: RoleRecord[] = (fallbackData.roles ?? []).map((role: any) => ({
  id: role.id,
  name: role.name,
  description: role.description,
}));

const stats = {
  totalUsers: users.length,
  activeUsers: users.filter((user) => user.status === 'active').length,
  totalTeams: teams.length,
  totalRoles: roles.length,
};

const UserPermissionsPage = ({ onNavigate, pageKey }: { onNavigate: (key: string) => void; pageKey: string }) => {
  const userColumns = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: '狀態', dataIndex: 'status', key: 'status' },
      { title: '登入次數', dataIndex: 'loginCount', key: 'loginCount' },
    ],
    []
  );

  const teamColumns = useMemo(
    () => [
      { title: '團隊名稱', dataIndex: 'name', key: 'name' },
      { title: '描述', dataIndex: 'description', key: 'description' },
    ],
    []
  );

  const roleColumns = useMemo(
    () => [
      { title: '角色名稱', dataIndex: 'name', key: 'name' },
      { title: '描述', dataIndex: 'description', key: 'description' },
    ],
    []
  );

  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: 'personnel-management',
      label: (
        <span>
          <UserOutlined /> 人員管理
        </span>
      ),
      children: (
        <DataTable<UserRecord>
          dataSource={users}
          columns={userColumns}
          rowKey={(record) => record.id}
        />
      ),
    },
    {
      key: 'team-management',
      label: (
        <span>
          <TeamOutlined /> 團隊管理
        </span>
      ),
      children: (
        <DataTable<TeamRecord>
          dataSource={teams}
          columns={teamColumns}
          rowKey={(record) => record.id}
        />
      ),
    },
    {
      key: 'role-management',
      label: (
        <span>
          <ApartmentOutlined /> 角色管理
        </span>
      ),
      children: (
        <DataTable<RoleRecord>
          dataSource={roles}
          columns={roleColumns}
          rowKey={(record) => record.id}
        />
      ),
    },
    {
      key: 'audit-logs',
      label: (
        <span>
          <AuditOutlined /> 審計日誌
        </span>
      ),
      children: (
        <Alert type="info" showIcon message="審計日誌模組建置中" />
      ),
    },
  ], []);

  const activeKey = tabItems.some((item) => item?.key === pageKey) ? pageKey : 'personnel-management';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="身份與存取管理"
        subtitle="統一管理使用者、團隊與角色權限"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="總人員數"
            value={stats.totalUsers}
            unit="人"
            status="info"
            description={`${stats.activeUsers} 位啟用中`}
            icon={<UserOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="團隊數量"
            value={stats.totalTeams}
            unit="個"
            status="info"
            description="跨域協作團隊"
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ContextualKPICard
            title="角色種類"
            value={stats.totalRoles}
            unit="種"
            status="success"
            description="支援精細權限控管"
            icon={<ApartmentOutlined />}
          />
        </Col>
      </Row>

      <Tabs items={tabItems} activeKey={activeKey} onChange={(key) => onNavigate(key)} />
    </Space>
  );
};

export default UserPermissionsPage;
