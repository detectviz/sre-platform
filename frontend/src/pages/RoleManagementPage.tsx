import React, { useState, useMemo } from 'react';
import { Layout, List, Typography, Card, Tree, Space, Button, Tag, Spin, Avatar, Modal, message } from 'antd';
import { PlusOutlined, ApartmentOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRoles } from '../hooks/useRoles';
import usePermissions from '../hooks/usePermissions';
import { PageHeader } from '../components';
import RoleFormModal from '../components/RoleFormModal';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

type Role = { id: string; name: string; is_built_in: boolean; permissions: string[] };

const RoleManagementPage: React.FC = () => {
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Add a 'permissions' field to roles for demo purposes
  const rolesWithPermissions = useMemo(() => {
    return roles.map((role: any) => {
      if (role.id === 'super_admin') {
        return { ...role, permissions: ['dashboard:read', 'resources:read', 'resources:create', 'resources:update', 'resources:delete', 'incidents:read', 'incidents:update', 'incidents:comment', 'admin:users:read', 'admin:users:write', 'admin:teams:read', 'admin:teams:write', 'admin:roles:read', 'admin:roles:write'] };
      }
      if (role.id === 'team_manager') {
        return { ...role, permissions: ['dashboard:read', 'resources:read', 'resources:create', 'incidents:read', 'incidents:update'] };
      }
      return { ...role, permissions: ['dashboard:read', 'resources:read', 'incidents:read'] };
    });
  }, [roles]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.is_built_in) {
      message.error('內建角色無法刪除');
      return;
    }
    Modal.confirm({
      title: `確定要刪除角色 ${role.name} 嗎？`,
      content: '此操作無法復原。',
      okText: '確定刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // @ts-ignore
          await api.deleteRole(role.id);
          message.success('角色已刪除');
        } catch {
          message.error('刪除失敗');
        }
      },
    });
  };

  const permissionTreeData = useMemo(() => {
    return permissions;
  }, [permissions]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="角色管理"
        subtitle="定義系統中的角色及其對應的操作權限"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
            新增角色
          </Button>
        }
      />
      <Layout style={{ background: 'transparent' }}>
        <Sider width={300} style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '8px', marginRight: '16px' }}>
          {rolesLoading ? <Spin /> : (
            <List
              dataSource={rolesWithPermissions}
              renderItem={(role: Role) => (
                <List.Item
                  onClick={() => handleSelectRole(role)}
                  actions={!role.is_built_in ? [
                    <Button type="link" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditRole(role); }} />,
                    <Button type="link" icon={<DeleteOutlined />} danger onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }} />
                  ] : []}
                  style={{
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '6px',
                    background: selectedRole?.id === role.id ? 'var(--brand-primary-light)' : 'transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ApartmentOutlined />} />}
                    title={<Text strong>{role.name}</Text>}
                    description={role.is_built_in ? <Tag color="geekblue">內建</Tag> : <Tag color="gold">自訂</Tag>}
                  />
                </List.Item>
              )}
            />
          )}
        </Sider>
        <Content style={{ background: 'var(--bg-elevated)', borderRadius: '8px', padding: '24px' }}>
          {selectedRole ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{selectedRole.name}</Title>
              <Text type="secondary">{selectedRole.is_built_in ? '內建角色，權限不可修改。' : '自訂角色，可編輯權限。'}</Text>
              <Card title="權限列表" style={{ marginTop: 16 }}>
                {permissionsLoading ? <Spin /> : (
                  <Tree
                    checkable
                    defaultExpandAll
                    treeData={permissionTreeData}
                    checkedKeys={selectedRole.permissions}
                    disabled={selectedRole.is_built_in}
                  />
                )}
              </Card>
            </Space>
          ) : (
            <Text type="secondary">請從左側選擇一個角色以查看其權限。</Text>
          )}
        </Content>
      </Layout>
      <RoleFormModal
        open={isModalOpen}
        role={editingRole}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
      />
    </Space>
  );
};

export default RoleManagementPage;
