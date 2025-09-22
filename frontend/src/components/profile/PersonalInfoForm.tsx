import React from 'react'
import { Form, Input, Select, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { Item } = Form
const { Option } = Select

interface PersonalInfoFormProps {
  initialValues?: Record<string, any>
  onSave?: (values: Record<string, any>) => void
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialValues,
  onSave
}) => {
  const [form] = Form.useForm()

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      onSave?.(values)
      message.success('個人資料已更新')
    } catch (error) {
      message.error('請檢查輸入資料')
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      style={{ maxWidth: 600 }}
    >
      <Item
        label="姓名"
        name="name"
        rules={[{ required: true, message: '請輸入姓名' }]}
      >
        <Input placeholder="請輸入您的姓名" />
      </Item>

      <Item
        label="電子郵件"
        name="email"
        rules={[
          { required: true, message: '請輸入電子郵件' },
          { type: 'email', message: '請輸入有效的電子郵件格式' }
        ]}
      >
        <Input placeholder="請輸入您的電子郵件" />
      </Item>

      <Item
        label="職位"
        name="position"
        rules={[{ required: true, message: '請選擇職位' }]}
      >
        <Select placeholder="請選擇您的職位">
          <Option value="sre">SRE 工程師</Option>
          <Option value="devops">DevOps 工程師</Option>
          <Option value="backend">後端工程師</Option>
          <Option value="frontend">前端工程師</Option>
          <Option value="qa">測試工程師</Option>
          <Option value="pm">產品經理</Option>
          <Option value="manager">技術主管</Option>
        </Select>
      </Item>

      <Item
        label="部門"
        name="department"
        rules={[{ required: true, message: '請選擇部門' }]}
      >
        <Select placeholder="請選擇您的部門">
          <Option value="engineering">工程部</Option>
          <Option value="operations">營運部</Option>
          <Option value="product">產品部</Option>
          <Option value="design">設計部</Option>
          <Option value="qa">品質保證部</Option>
        </Select>
      </Item>

      <Item
        label="電話"
        name="phone"
      >
        <Input placeholder="請輸入您的電話號碼" />
      </Item>

      <Item>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
        >
          儲存變更
        </Button>
      </Item>
    </Form>
  )
}