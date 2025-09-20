import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Button, message, Transfer } from 'antd';
import type { TransferItem } from 'antd/es/transfer';
import api from '../services/api';
import { useUsers } from '../hooks/useUsers';
import type { User } from '../hooks/useUsers';

type TeamRecord = {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  members?: string[]; // 假設 API 回傳成員識別碼陣列
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
  members: string[];
};

type TeamPayload = {
  name: string;
  description?: string | null;
  members: string[];
};

const TeamFormModal: React.FC<TeamFormModalProps> = ({ open, team, onCancel, onSuccess }) => {
  const [form] = Form.useForm<TeamFormValues>();
  const [loading, setLoading] = useState(false);
  const { users, loading: usersLoading } = useUsers();
  const [targetMemberKeys, setTargetMemberKeys] = useState<string[]>([]);
  const [selectedMemberKeys, setSelectedMemberKeys] = useState<string[]>([]);

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
      members: initialMembers,
    });
    setTargetMemberKeys(initialMembers);
    setSelectedMemberKeys([]);
  }, [team, open, form]);

  const handleSubmit = async (values: TeamFormValues) => {
    setLoading(true);
    try {
      const trimmedName = values.name.trim();
      const sanitizedMembers = Array.isArray(values.members) ? Array.from(new Set(values.members)) : [];

      if (!trimmedName) {
        message.error('請輸入團隊名稱');
        setLoading(false);
        return;
      }

      const payload: TeamPayload = {
        name: trimmedName,
        description: values.description?.trim() ? values.description.trim() : null,
        members: sanitizedMembers,
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
          label="團隊成員"
          extra="右欄為已指派成員，可透過搜尋或箭頭快速移動"
        >
          <Form.Item name="members" hidden>
            <Input type="hidden" />
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
            listStyle={{ width: '100%', minWidth: 220, height: 260 }}
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
      </Form>
    </Modal>
  );
};

export default TeamFormModal;
