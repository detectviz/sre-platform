import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Col,
  Descriptions,
  Divider,
  Form,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import api from '../services/api';
import { useTeams } from '../hooks/useTeams';
import { useRoles } from '../hooks/useRoles';
import { GlassModal } from './GlassModal';

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

  const teamOptions = useMemo(
    () => teams.map((team) => ({ label: team.name, value: team.id })),
    [teams],
  );

  const roleOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.id })),
    [roles],
  );

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        roles: user.roles,
        teams: user.teams,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleUpdate = async (values: { roles: string[]; teams: string[] }) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.updateUser(user.id, {
        role_ids: values.roles,
        team_ids: values.teams,
      });
      message.success(`使用者 ${user.name} 的權限已更新`);
      onSuccess();
    } catch {
      message.error('更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoles = Form.useWatch('roles', form) as string[] | undefined;
  const selectedTeams = Form.useWatch('teams', form) as string[] | undefined;

  const selectedRoleBadges = useMemo(
    () => (selectedRoles || []).map((roleId) => {
      const role = roles.find((item) => item.id === roleId);
      return (
        <Tag key={roleId} color="blue" style={{ marginBottom: 4 }}>
          {role?.name ?? roleId}
        </Tag>
      );
    }),
    [roles, selectedRoles],
  );

  const selectedTeamBadges = useMemo(
    () => (selectedTeams || []).map((teamId) => {
      const team = teams.find((item) => item.id === teamId);
      return (
        <Tag key={teamId} color="purple" style={{ marginBottom: 4 }}>
          {team?.name ?? teamId}
        </Tag>
      );
    }),
    [teams, selectedTeams],
  );

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <GlassModal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="儲存變更"
      cancelText="取消"
      confirmLoading={loading}
      title={(
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ color: 'var(--text-primary)', marginBottom: 0 }}>
            編輯人員權限
          </Typography.Title>
          {user ? (
            <Typography.Text type="secondary">
              {user.name} · {user.email}
            </Typography.Text>
          ) : null}
        </Space>
      )}
      width={720}
    >
      {user ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="資料來源"
            description="姓名與電子郵件由身份提供商管理，僅供檢視。如需修改，請至 Keycloak 後台。"
          />

          <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space align="center" size="small">
                <Typography.Title level={5} style={{ margin: 0 }}>基本資訊</Typography.Title>
                <Tag color="geekblue">SSO · Keycloak</Tag>
              </Space>
              <Descriptions
                size="small"
                column={1}
                colon={false}
                labelStyle={{ width: 96, color: 'var(--text-tertiary)' }}
                contentStyle={{ color: 'var(--text-primary)' }}
              >
                <Descriptions.Item
                  label={(
                    <Tooltip title="此資訊由 SSO 同步，無法在此編輯">
                      <span>姓名</span>
                    </Tooltip>
                  )}
                >
                  <Typography.Text strong>{user.name}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={(
                    <Tooltip title="此資訊由 SSO 同步，無法在此編輯">
                      <span>電子郵件</span>
                    </Tooltip>
                  )}
                >
                  <Typography.Text>{user.email}</Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </div>

          <Divider orientation="left" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <Typography.Text strong>權限設定</Typography.Text>
          </Divider>

          <Form form={form} layout="vertical" onFinish={handleUpdate} requiredMark={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="roles"
                  label="角色"
                  rules={[{ required: true, message: '請至少選擇一個角色' }]}
                >
                  <Select
                    mode="multiple"
                    loading={rolesLoading}
                    placeholder="請選擇角色"
                    options={roleOptions}
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="teams"
                  label="所屬團隊"
                  rules={[{ required: true, message: '請至少選擇一個團隊' }]}
                >
                  <Select
                    mode="multiple"
                    loading={teamsLoading}
                    placeholder="請選擇團隊"
                    options={teamOptions}
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
            </Row>
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
              <Typography.Text strong>變更預覽</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                儲存後將套用以下角色與團隊映射，後端會產生審計日誌以供追蹤。
              </Typography.Text>
              <Space direction="vertical" size="small">
                <Typography.Text type="secondary">角色</Typography.Text>
                <Space wrap>{selectedRoleBadges.length > 0 ? selectedRoleBadges : <Tag color="default">尚未選擇角色</Tag>}</Space>
              </Space>
              <Space direction="vertical" size="small">
                <Typography.Text type="secondary">所屬團隊</Typography.Text>
                <Space wrap>{selectedTeamBadges.length > 0 ? selectedTeamBadges : <Tag color="default">尚未選擇團隊</Tag>}</Space>
              </Space>
            </Space>
          </div>
        </Space>
      ) : (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Spin />
        </div>
      )}
    </GlassModal>
  );
};

export default EditUserModal;
