import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Form, Input, Space, Tag, Typography, message } from 'antd';
import api from '../services/api';
import PermissionTreeSelector from './PermissionTreeSelector';
import { GlassModal } from './GlassModal';

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
  const [permissionSearch, setPermissionSearch] = useState('');

  useEffect(() => {
    if (open) {
      if (role) {
        form.setFieldsValue(role);
      } else {
        form.resetFields();
      }
      setPermissionSearch('');
    }
  }, [role, open, form]);

  const handleSubmit = async (values: { name: string; description: string; permissions: string[] }) => {
    setLoading(true);
    try {
      const trimmedName = values.name.trim();
      const sanitizedDescription = values.description?.trim() ?? '';
      const uniquePermissions = Array.isArray(values.permissions)
        ? Array.from(new Set(values.permissions))
        : [];

      if (!trimmedName) {
        message.error('請輸入角色名稱');
        setLoading(false);
        return;
      }

      const payload = {
        name: trimmedName,
        description: sanitizedDescription,
        permissions: uniquePermissions,
      };

      if (role) {
        await api.updateRole(role.id, payload);
        message.success(`角色 ${trimmedName} 已更新`);
      } else {
        await api.createRole(payload);
        message.success(`角色 ${trimmedName} 已建立`);
      }
      onSuccess();
    } catch {
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const selectedPermissions = Form.useWatch('permissions', form) as string[] | undefined;
  const permissionPreview = useMemo(() => {
    const list = selectedPermissions ?? [];
    const preview = list.slice(0, 10);
    const remaining = list.length - preview.length;

    return {
      previewTags: preview.map((permission) => (
        <Tag key={permission} color="blue" style={{ marginBottom: 4 }}>
          {permission}
        </Tag>
      )),
      remaining,
    };
  }, [selectedPermissions]);

  const handleCancel = () => {
    form.resetFields();
    setPermissionSearch('');
    onCancel();
  };

  return (
    <GlassModal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText={role ? '儲存變更' : '建立角色'}
      cancelText="取消"
      confirmLoading={loading}
      title={(
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ color: 'var(--text-primary)', marginBottom: 0 }}>
            {role ? '編輯角色' : '新增角色'}
          </Typography.Title>
          <Typography.Text type="secondary">
            組合權限為可重用的角色範本，所有調整皆會寫入審計日誌
          </Typography.Text>
        </Space>
      )}
      width={760}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          showIcon
          type="info"
          message="權限即程式碼"
          description="角色定義應與後端權限碼保持一致，建議先複製現有角色再調整，以維持權限治理的一致性。"
        />

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

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Input.Search
              value={permissionSearch}
              onChange={(event) => setPermissionSearch(event.target.value)}
              placeholder="搜尋權限名稱或代碼，例如 incidents:update"
              allowClear
              disabled={role?.is_built_in}
            />

            <Form.Item
              name="permissions"
              label="權限配置"
              rules={[{ required: true, message: '請至少選擇一個權限' }]}
            >
              <PermissionTreeSelector
                value={form.getFieldValue('permissions')}
                onChange={(permissions) => form.setFieldsValue({ permissions })}
                disabled={role?.is_built_in}
                searchValue={permissionSearch}
              />
            </Form.Item>
          </Space>

          {role?.is_built_in && (
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              ℹ️ 內建角色無法修改，如需自訂權限請建立新角色
            </Typography.Text>
          )}
        </Form>

        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 16,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Typography.Text strong>權限摘要</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              已選擇 {selectedPermissions?.length ?? 0} 項權限，將於儲存時同步至 RBAC 配置。
            </Typography.Text>
            <Space wrap>
              {permissionPreview.previewTags.length > 0
                ? permissionPreview.previewTags
                : <Tag color="default">尚未選擇權限</Tag>}
              {permissionPreview.remaining > 0 && (
                <Tag color="geekblue">+{permissionPreview.remaining} 更多</Tag>
              )}
            </Space>
          </Space>
        </div>
      </Space>
    </GlassModal>
  );
};

export default RoleFormModal;
