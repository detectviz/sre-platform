import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Tree, Spin } from 'antd';
import api from '../services/api';
import usePermissions from '../hooks/usePermissions';

type Role = {
  id: string;
  name: string;
  is_built_in: boolean;
  permissions: string[];
};

interface RoleFormModalProps {
  open: boolean;
  role?: Role | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ open, role, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { permissions, loading: permissionsLoading } = usePermissions();

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue(role);
      } else {
        form.resetFields();
      }
    }
  }, [role, open, form]);

  const handleSubmit = async (values: { name: string; permissions: string[] }) => {
    setLoading(true);
    try {
      if (role) {
        // @ts-ignore
        await api.updateRole(role.id, values);
        message.success(`角色 ${values.name} 已更新`);
      } else {
        // @ts-ignore
        await api.createRole(values);
        message.success(`角色 ${values.name} 已建立`);
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
      title={role ? '編輯角色' : '新增角色'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {role ? '儲存變更' : '建立角色'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="角色名稱"
          rules={[{ required: true, message: '請輸入角色名稱' }]}
        >
          <Input placeholder="例如：唯讀使用者" disabled={!!role} />
        </Form.Item>
        <Form.Item name="permissions" label="權限">
          {permissionsLoading ? <Spin /> : (
            <Tree
              checkable
              defaultExpandAll
              treeData={permissions}
              onCheck={(checked) => {
                form.setFieldsValue({ permissions: checked });
              }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
