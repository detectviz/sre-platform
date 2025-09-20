import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
  message,
  Transfer,
} from 'antd';
import type { TabsProps } from 'antd';
import type { TransferItem } from 'antd/es/transfer';
import api from '../services/api';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../hooks/useUsers';
import { GlassModal } from './GlassModal';

type TeamRecord = {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  members?: string[]; // 假設 API 回傳成員識別碼陣列
  leader_id?: string | null;
  subscribers?: string[];
  responsibilities?: Array<{
    type: string;
    name: string;
    identifier?: string;
  }>;
};

interface TeamFormModalProps {
  open: boolean;
  team?: TeamRecord | null;
  onCancel: () => void;
  onSuccess: () => void;
}

type TeamFormValues = {
  name: string;
  description?: string;
  leader_id?: string;
  members: string[];
  subscribers: string[];
};

type TeamPayload = {
  name: string;
  description?: string | null;
  leader_id?: string | null;
  member_ids: string[];
  subscriber_emails: string[];
};

const TeamFormModal: React.FC<TeamFormModalProps> = ({ open, team, onCancel, onSuccess }) => {
  const [form] = Form.useForm<TeamFormValues>();
  const [loading, setLoading] = useState(false);
  const { users, loading: usersLoading } = useUsers();
  const [targetMemberKeys, setTargetMemberKeys] = useState<string[]>([]);
  const [selectedMemberKeys, setSelectedMemberKeys] = useState<string[]>([]);
  const leaderId = Form.useWatch('leader_id', form);
  const subscriberList = Form.useWatch('subscribers', form) as string[] | undefined;

  const memberOptions: TransferItem[] = useMemo(() => {
    if (users.length === 0) {
      return [];
    }

    const optionMap = new Map<string, TransferItem>();
    users.forEach((user: User) => {
      const rawId = user.id ?? user.email ?? user.name;
      if (!rawId) {
        return;
      }
      const key = String(rawId);
      const trimmedName = user.name.trim();
      const trimmedEmail = user.email.trim();
      const displayName = trimmedName ? trimmedName : key;

      optionMap.set(key, {
        key,
        title: displayName,
        description: trimmedEmail || undefined,
      });
    });

    return Array.from(optionMap.values());
  }, [users]);

  useEffect(() => {
    setTargetMemberKeys((previous) => previous.filter((key) => memberOptions.some((item) => item.key === key)));
  }, [memberOptions]);

  useEffect(() => {
    if (!open) {
      setTargetMemberKeys([]);
      setSelectedMemberKeys([]);
      form.resetFields();
      return;
    }
    const initialMembers = Array.isArray(team?.members)
      ? [...team.members]
      : [];
    form.setFieldsValue({
      name: team?.name ?? '',
      description: team?.description ?? '',
      leader_id: team?.leader_id ?? undefined,
      members: initialMembers,
      subscribers: team?.subscribers ?? [],
    });
    setTargetMemberKeys(initialMembers);
    setSelectedMemberKeys([]);
  }, [team, open, form]);

  useEffect(() => {
    if (leaderId && !targetMemberKeys.includes(leaderId)) {
      const nextKeys = [...targetMemberKeys, leaderId];
      setTargetMemberKeys(nextKeys);
      form.setFieldsValue({ members: nextKeys });
    }
  }, [leaderId, targetMemberKeys, form]);

  const handleSubmit = async (values: TeamFormValues) => {
    setLoading(true);
    try {
      const trimmedName = values.name.trim();
      const sanitizedMembers = Array.isArray(values.members) ? Array.from(new Set(values.members)) : [];
      const sanitizedSubscribers = Array.isArray(values.subscribers)
        ? Array.from(
            new Set(
              values.subscribers
                .map((item) => item.trim())
                .filter((item) => item.length > 0),
            ),
          )
        : [];

      if (!trimmedName) {
        message.error('請輸入團隊名稱');
        setLoading(false);
        return;
      }

      const payload: TeamPayload = {
        name: trimmedName,
        description: values.description?.trim() ? values.description.trim() : null,
        leader_id: values.leader_id ?? null,
        member_ids: sanitizedMembers,
        subscriber_emails: sanitizedSubscribers,
      };
      if (team) {
        await api.updateTeam(team.id, payload);
        message.success(`團隊「${trimmedName}」已更新`);
      } else {
        await api.createTeam(payload);
        message.success(`團隊「${trimmedName}」已建立`);
      }
      onSuccess();
    } catch (error) {
      console.error('[TeamFormModal] 無法儲存團隊資訊', error);
      message.error('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const memberOptionMap = useMemo(() => {
    const map = new Map<string, TransferItem>();
    memberOptions.forEach((item) => {
      map.set(String(item.key), item);
    });
    return map;
  }, [memberOptions]);

  const leaderOptions = useMemo(
    () =>
      targetMemberKeys.map((key) => {
        const option = memberOptionMap.get(key);
        return {
          label: option?.title ?? key,
          value: key,
        };
      }),
    [memberOptionMap, targetMemberKeys],
  );

  const memberPreviewTags = useMemo(
    () =>
      targetMemberKeys.map((key) => {
        const option = memberOptionMap.get(key);
        return (
          <Tag key={key} color="blue" style={{ marginBottom: 4 }}>
            {option?.title ?? key}
          </Tag>
        );
      }),
    [memberOptionMap, targetMemberKeys],
  );

  const subscriberTags = useMemo(
    () =>
      (subscriberList || []).map((email) => (
        <Tag key={email} color="purple" style={{ marginBottom: 4 }}>
          {email}
        </Tag>
      )),
    [subscriberList],
  );

  const responsibilities = team?.responsibilities ?? [];

  const tabItems: TabsProps['items'] = [
    {
      key: 'members',
      label: '核心成員',
      children: (
        <Form.Item
          label="團隊成員"
          extra="右欄為已指派成員，可透過搜尋或箭頭快速移動"
        >
          <Form.Item name="members" hidden>
            <input type="hidden" />
          </Form.Item>
          <Transfer
            dataSource={memberOptions}
            titles={['候選成員', '團隊成員']}
            showSearch
            targetKeys={targetMemberKeys}
            selectedKeys={selectedMemberKeys}
            onChange={(nextKeys) => {
              setTargetMemberKeys(nextKeys);
              setSelectedMemberKeys((previous) => previous.filter((key) => nextKeys.includes(key)));
              form.setFieldsValue({ members: nextKeys });
            }}
            onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
              setSelectedMemberKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
            }}
            render={(item) => ({
              label: (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>{item.title}</span>
                  {item.description ? (
                    <span style={{ fontSize: 12, color: 'var(--text-secondary, rgba(255, 255, 255, 0.65))' }}>
                      {item.description}
                    </span>
                  ) : null}
                </div>
              ),
              value: `${item.title}${item.description ? ` ${item.description}` : ''}`,
            })}
            listStyle={{ width: '100%', minWidth: 260, height: 280 }}
            style={{ width: '100%' }}
            locale={{
              itemUnit: '位',
              itemsUnit: '位',
              notFoundContent: usersLoading ? '載入使用者中…' : '沒有可用成員',
            }}
            disabled={usersLoading}
            filterOption={(inputValue, item) => {
              const keyword = inputValue.toLowerCase();
              return (
                (item?.title ?? '').toString().toLowerCase().includes(keyword)
                || (item?.description ?? '').toString().toLowerCase().includes(keyword)
              );
            }}
          />
        </Form.Item>
      ),
    },
    {
      key: 'subscribers',
      label: '通知訂閱者',
      children: (
        <Form.Item
          name="subscribers"
          label="訂閱者電子郵件"
          tooltip="訂閱者會接收與此團隊相關的通知，但不具備操作權限"
        >
          <Select
            mode="tags"
            placeholder="輸入或貼上電子郵件，按 Enter 建立"
            tokenSeparators={[',', ';', ' ']}
            open={false}
          />
        </Form.Item>
      ),
    },
  ];

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <GlassModal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText={team ? '儲存變更' : '建立團隊'}
      cancelText="取消"
      confirmLoading={loading}
      title={(
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Typography.Title level={4} style={{ color: 'var(--text-primary)', marginBottom: 0 }}>
            {team ? '編輯團隊' : '新增團隊'}
          </Typography.Title>
          <Typography.Text type="secondary">
            定義團隊負責範圍，並建立成員與通知映射
          </Typography.Text>
        </Space>
      )}
      width={840}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          showIcon
          type="info"
          message="團隊即問責"
          description="團隊是連結資源、事件與通知的核心樞紐。請同時指定負責人、核心成員與需要被動接收通知的訂閱者。"
        />

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space direction="horizontal" size="large" style={{ width: '100%', flexWrap: 'wrap' }}>
              <Form.Item
                name="name"
                label="團隊名稱"
                rules={[{ required: true, message: '請輸入團隊名稱' }]}
                style={{ flex: '1 1 260px' }}
              >
                <Input placeholder="例如：SRE 核心團隊" />
              </Form.Item>

              <Form.Item
                name="leader_id"
                label="負責人"
                rules={[{ required: true, message: '請選擇團隊負責人' }]}
                style={{ flex: '1 1 220px' }}
              >
                <Select
                  placeholder="從成員中選擇負責人"
                  options={leaderOptions}
                  loading={usersLoading}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="description"
              label="團隊職責描述"
            >
              <Input.TextArea rows={3} placeholder="描述團隊的目標、排班或負責範圍" />
            </Form.Item>

            <Tabs defaultActiveKey="members" items={tabItems} />
          </Space>
        </Form>

        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 16,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Typography.Text strong>設定預覽</Typography.Text>
            <Space direction="vertical" size="small">
              <Typography.Text type="secondary">負責人</Typography.Text>
              <Tag color="geekblue">{leaderOptions.find((option) => option.value === leaderId)?.label ?? '尚未選擇負責人'}</Tag>
            </Space>
            <Space direction="vertical" size="small">
              <Typography.Text type="secondary">核心成員</Typography.Text>
              <Space wrap>{memberPreviewTags.length > 0 ? memberPreviewTags : <Tag>尚未指派成員</Tag>}</Space>
            </Space>
            <Space direction="vertical" size="small">
              <Typography.Text type="secondary">通知訂閱者</Typography.Text>
              <Space wrap>{subscriberTags.length > 0 ? subscriberTags : <Tag>尚未設定訂閱者</Tag>}</Space>
            </Space>
          </Space>
        </div>

        <div
          style={{
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Typography.Text strong>責任範圍</Typography.Text>
            {responsibilities.length > 0 ? (
              <Space direction="vertical" size={4}>
                {responsibilities.map((item, index) => (
                  <Tag key={`${item.type}-${item.identifier ?? index}`} color="gold" style={{ padding: '4px 12px' }}>
                    {item.name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                儲存後可於團隊詳情頁檢視「資源群組」與「通知策略」等責任關聯。
              </Typography.Text>
            )}
          </Space>
        </div>
      </Space>
    </GlassModal>
  );
};

export default TeamFormModal;
