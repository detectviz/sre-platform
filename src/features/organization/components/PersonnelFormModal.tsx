import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User } from '../../../services/api-client';
import { useListTeamsQuery } from '../../../services/organizationApi';

const { Option } = Select;

interface PersonnelFormModalProps {
  visible: boolean;
  loading: boolean;
  initialData?: User | null;
  onCancel: () => void;
  onOk: (values: any) => void; // TODO: Define a proper type for form values
}

// 預定義的角色選項
const roleOptions = [
  { label: '超級管理員', value: '超級管理員' },
  { label: '團隊管理員', value: '團隊管理員' },
  { label: '一般使用者', value: '一般使用者' },
];

/**
 * 新增/編輯人員的彈出式表單
 */
const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  visible,
  loading,
  initialData,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  // 獲取團隊列表以供選擇
  const { data: teamsData, isLoading: teamsLoading } = useListTeamsQuery({});

  // 當 initialData 變化時，重設表單欄位
  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          // 'teams' 欄位需要 team IDs 陣列
          team_ids: initialData.teams?.map(t => t.id),
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
      title={isEditing ? '編輯人員' : '新增人員'}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="personnel_form">
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '請輸入姓名！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="role"
          label="角色"
          rules={[{ required: true, message: '請選擇角色！' }]}
        >
          <Select options={roleOptions} />
        </Form.Item>
        <Form.Item
          name="team_ids"
          label="團隊歸屬"
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="請選擇團隊"
            loading={teamsLoading}
          >
            {teamsData?.items?.map(team => (
              <Option key={team.id} value={team.id!}>{team.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PersonnelFormModal;
