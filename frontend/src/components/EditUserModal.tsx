import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Spin } from 'antd';
import api from '../services/api';
import { useTeams } from '../hooks/useTeams';
import { useRoles } from '../hooks/useRoles';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  last_login_at: string;
  roles: string[];
  teams: string[];
};

interface EditUserModalProps {
  open: boolean;
  user: UserRecord | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, user, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const { teams, loading: teamsLoading } = useTeams();
  const { roles, loading: rolesLoading } = useRoles();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        roles: user.roles,
        teams: user.teams,
      });
    }
  }, [user, form]);

  const handleUpdate = async (values: { roles: string[]; teams: string[] }) => {
    if (!user) return;
    setLoading(true);
    try {
      // @ts-ignore - api.updateUser is not defined yet
      await api.updateUser(user.id, {
        role_ids: values.roles,
        team_ids: values.teams,
      });
      message.success(`使用者 ${user.name} 的權限已更新`);
      onSuccess();
    } catch (error) {
      message.error('更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="編輯人員權限"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          儲存變更
        </Button>,
      ]}
    >
      {user ? (
        <Form form={form} layout="vertical" onFinish={handleUpdate} requiredMark={false}>
          <Form.Item name="name" label="姓名">
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item name="email" label="電子郵件">
            <Input readOnly disabled />
          </Form.Item>
          <Form.Item name="roles" label="角色">
            <Select
              mode="multiple"
              loading={rolesLoading}
              placeholder="請選擇角色"
              options={roles.map((role: any) => ({
                label: role.name,
                value: role.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="teams" label="團隊">
            <Select
              mode="multiple"
              loading={teamsLoading}
              placeholder="請選擇團隊"
              options={teams.map((team: any) => ({
                label: team.name,
                value: team.id,
              }))}
            />
          </Form.Item>
        </Form>
      ) : (
        <Spin />
      )}
    </Modal>
  );
};

export default EditUserModal;
