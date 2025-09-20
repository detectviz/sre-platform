import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Typography } from 'antd';
import api from '../services/api';
import PermissionTreeSelector from './PermissionTreeSelector';

type Role = {
  id: string;
  name: string;
  description?: string;
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

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue(role);
      } else {
        form.resetFields();
      }
    }
  }, [role, open, form]);

  const handleSubmit = async (values: { name: string; description: string; permissions: string[] }) => {
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
          <Input
            placeholder="例如：SRE 工程師"
            disabled={role?.is_built_in}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="角色描述"
        >
          <Input.TextArea
            rows={2}
            placeholder="描述這個角色的職責和權限範圍"
            disabled={role?.is_built_in}
          />
        </Form.Item>

        <Form.Item
          name="permissions"
          label="權限配置"
          rules={[{ required: true, message: '請至少選擇一個權限' }]}
        >
          <PermissionTreeSelector
            value={form.getFieldValue('permissions')}
            onChange={(permissions) => form.setFieldsValue({ permissions })}
            disabled={role?.is_built_in}
          />
        </Form.Item>

        {role?.is_built_in && (
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            ℹ️ 內建角色無法修改，如需自訂權限請建立新角色
          </Typography.Text>
        )}
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
