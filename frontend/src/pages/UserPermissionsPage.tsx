import { useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  AuditOutlined,
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Alert, Button, Col, Modal, Row, Space, Tabs, Tag, message } from 'antd';
import type { TabsProps } from 'antd';
import { ContextualKPICard, DataTable, PageHeader } from '../components';
import InviteUserModal from '../components/InviteUserModal';
import EditUserModal from '../components/EditUserModal';
import TeamFormModal from '../components/TeamFormModal';
import { useUsers } from '../hooks/useUsers';
import { useTeams } from '../hooks/useTeams';
import { useRoles } from '../hooks/useRoles';

// Define types based on openapi.yaml
type UserRecord = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string;
  roles: string[];
  teams: string[];
};

type TeamRecord = {
  id: string;
  name: string;
  description?: string;
  member_count: number;
};

type RoleRecord = {
  id: string;
  name: string;
  description?: string;
  is_built_in: boolean;
};

const UserPermissionsPage = ({ onNavigate, pageKey }: { onNavigate: (key: string) => void; pageKey: string }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamRecord | null>(null);

  const { users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { teams, loading: teamsLoading, error: teamsError, refetch: refetchTeams } = useTeams();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();

  const handleEditUser = (user: UserRecord) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserRecord) => {
    Modal.confirm({
      title: `確定要刪除人員 ${user.name} 嗎？`,
      content: '此操作將會軟刪除該人員，但不會影響其在身份提供商中的狀態。',
      okText: '確定刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // @ts-ignore
          await api.deleteUser(user.id);
          message.success('人員已刪除');
          refetchUsers();
        } catch {
          message.error('刪除失敗');
        }
      },
    });
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: TeamRecord) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = (team: TeamRecord) => {
    Modal.confirm({
      title: `確定要刪除團隊 ${team.name} 嗎？`,
      content: '此操作無法復原。',
      okText: '確定刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // @ts-ignore
          await api.deleteTeam(team.id);
          message.success('團隊已刪除');
          refetchTeams();
        } catch {
          message.error('刪除失敗');
        }
      },
    });
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.is_active).length,
    totalTeams: teams.length,
    totalRoles: roles.length,
  };

  const userColumns = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      {
        title: '狀態',
        dataIndex: 'is_active',
        key: 'is_active',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'success' : 'error'}>{isActive ? '啟用中' : '已停用'}</Tag>
        )
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        render: (roleIds: string[]) => roleIds.map(id => {
          const role = roles.find(r => r.id === id);
          return <Tag key={id}>{role ? role.name : id}</Tag>;
        })
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: UserRecord) => (
          <Space size="middle">
            <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteUser(record)} />
          </Space>
        ),
      },
    ],
    [roles]
  );

  const teamColumns = useMemo(
    () => [
      { title: '團隊名稱', dataIndex: 'name', key: 'name' },
      { title: '描述', dataIndex: 'description', key: 'description' },
      { title: '成員數', dataIndex: 'member_count', key: 'member_count' },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: TeamRecord) => (
          <Space size="middle">
            <Button icon={<EditOutlined />} onClick={() => handleEditTeam(record)} />
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteTeam(record)} />
          </Space>
        ),
      },
    ],
    []
  );

  const roleColumns = useMemo(
    () => [
      { title: '角色名稱', dataIndex: 'name', key: 'name' },
      { title: '描述', dataIndex: 'description', key: 'description' },
      {
        title: '類型',
        dataIndex: 'is_built_in',
        key: 'is_built_in',
        render: (isBuiltIn: boolean) => (
          <Tag color={isBuiltIn ? 'geekblue' : 'gold'}>{isBuiltIn ? '內建' : '自訂'}</Tag>
        ),
      },
    ],
    []
  );

  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: 'personnel-management',
      label: (
        <Space>
          <UserOutlined /> 人員管理
        </Space>
      ),
      children: (
        <DataTable<UserRecord>
          loading={usersLoading}
          dataSource={users}
          columns={userColumns}
          rowKey="id"
          error={usersError}
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsInviteModalOpen(true)}>
              邀請人員
            </Button>
          }
        />
      ),
    },
    {
      key: 'team-management',
      label: (
        <Space>
          <TeamOutlined /> 團隊管理
        </Space>
      ),
      children: (
        <DataTable<TeamRecord>
          loading={teamsLoading}
          dataSource={teams}
          columns={teamColumns}
          rowKey="id"
          error={teamsError}
           actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeam}>
              新增團隊
            </Button>
          }
        />
      ),
    },
    {
      key: 'role-management',
      label: (
        <Space>
          <ApartmentOutlined /> 角色管理
        </Space>
      ),
      children: (
        <DataTable<RoleRecord>
          loading={rolesLoading}
          dataSource={roles}
          columns={roleColumns}
          rowKey="id"
          error={rolesError}
           actions={
            <Button type="primary" icon={<PlusOutlined />}>
              新增角色
            </Button>
          }
        />
      ),
    },
    {
      key: 'audit-logs',
      label: (
        <Space>
          <AuditOutlined /> 審計日誌
        </Space>
      ),
      children: (
        <Alert type="info" showIcon message="審計日誌模組建置中" />
      ),
    },
  ], [users, teams, roles, userColumns, teamColumns, roleColumns, usersLoading, teamsLoading, rolesLoading, usersError, teamsError, rolesError]);

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

      <InviteUserModal
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false);
          refetchUsers();
        }}
      />

      <EditUserModal
        open={isEditModalOpen}
        user={selectedUser}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          refetchUsers();
        }}
      />

      <TeamFormModal
        open={isTeamModalOpen}
        team={selectedTeam}
        onCancel={() => {
          setIsTeamModalOpen(false);
          setSelectedTeam(null);
        }}
        onSuccess={() => {
          setIsTeamModalOpen(false);
          setSelectedTeam(null);
          refetchTeams();
        }}
      />
    </Space>
  );
};

export default UserPermissionsPage;
