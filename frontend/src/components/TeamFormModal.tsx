import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Select, Spin } from 'antd';
import api from '../services/api';
import { useUsers } from '../hooks/useUsers';

type TeamRecord = {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  members?: string[]; // Assuming API returns member IDs
};

interface TeamFormModalProps {
  open: boolean;
  team?: TeamRecord | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TeamFormModal: React.FC<TeamFormModalProps> = ({ open, team, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const { users, loading: usersLoading } = useUsers();

  useEffect(() => {
    if (open) {
      if (team) {
        form.setFieldsValue(team);
      } else {
        form.resetFields();
      }
    }
  }, [team, open, form]);

  const handleSubmit = async (values: { name: string; description: string; members: string[] }) => {
    setLoading(true);
    try {
      if (team) {
        // @ts-ignore
        await api.updateTeam(team.id, values);
        message.success(`團隊 ${values.name} 已更新`);
      } else {
        // @ts-ignore
        await api.createTeam(values);
        message.success(`團隊 ${values.name} 已建立`);
      }
      onSuccess();
    } catch (error) {
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={team ? '編輯團隊' : '新增團隊'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {team ? '儲存變更' : '建立團隊'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="團隊名稱"
          rules={[{ required: true, message: '請輸入團隊名稱' }]}
        >
          <Input placeholder="例如：SRE 核心團隊" />
        </Form.Item>
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={3} placeholder="請輸入團隊的職責或目標" />
        </Form.Item>
        <Form.Item
          name="members"
          label="團隊成員"
        >
          <Select
            mode="multiple"
            allowClear
            loading={usersLoading}
            placeholder="從現有使用者中搜尋並新增成員"
            options={users.map((user: any) => ({
              label: `${user.name} (${user.email})`,
              value: user.id,
            }))}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamFormModal;
