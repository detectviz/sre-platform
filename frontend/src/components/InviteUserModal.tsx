import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import api from '../services/api';

interface InviteUserModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleInvite = async (values: { email: string }) => {
    setLoading(true);
    try {
      // @ts-ignore - api.inviteUser is not defined yet
      await api.inviteUser(values.email);
      message.success(`邀請已成功發送至 ${values.email}`);
      onSuccess();
      form.resetFields();
    } catch (error) {
      message.error('邀請失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="邀請新人員"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          發送邀請
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleInvite} requiredMark={false}>
        <Form.Item
          name="email"
          label="電子郵件地址"
          rules={[
            { required: true, message: '請輸入電子郵件地址' },
            { type: 'email', message: '請輸入有效的電子郵件地址' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="e.g., user@example.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InviteUserModal;
