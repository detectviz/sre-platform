import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { Team } from '../../../services/api-client';
import { useListUsersQuery } from '../../../services/organizationApi';

const { Option } = Select;

interface TeamFormModalProps {
  visible: boolean;
  loading: boolean;
  initialData?: Team | null;
  onCancel: () => void;
  onOk: (values: any) => void;
}

/**
 * 新增/編輯團隊的彈出式表單
 */
const TeamFormModal: React.FC<TeamFormModalProps> = ({
  visible,
  loading,
  initialData,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  // 獲取使用者列表以供選擇
  const { data: usersData, isLoading: usersLoading } = useListUsersQuery({});

  // TODO: 未來在此處加入 Channels 的查詢，並將其與使用者合併
  const subscriberOptions = useMemo(() => {
    return usersData?.items?.map(user => ({
      label: `人員: ${user.name}`,
      value: `user:${user.id}`,
    })) || [];
  }, [usersData]);

  // 當 initialData 變化時，重設表單欄位
  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          name: initialData.name,
          // 過濾掉非使用者的訂閱者，因為目前 UI 只支援選擇使用者
          subscriber_ids: initialData.subscribers?.filter(s => s.type === 'user').map(s => `user:${s.id}`),
        });
      } else {
        form.resetFields();
      }
    }
  }, [initialData, visible, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        onOk(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={isEditing ? '編輯團隊' : '新增團隊'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="team_form">
        <Form.Item
          name="name"
          label="團隊名稱"
          rules={[{ required: true, message: '請輸入團隊名稱！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="subscriber_ids"
          label="通知訂閱者 (僅支援人員)"
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="搜尋人員..."
            loading={usersLoading}
            options={subscriberOptions}
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamFormModal;
