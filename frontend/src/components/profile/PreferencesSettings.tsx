import React from 'react'
import { Form, Select, Switch, Space, Button, Typography, message } from 'antd'
import {
  BgColorsOutlined,
  GlobalOutlined,
  LayoutOutlined,
  SaveOutlined
} from '@ant-design/icons'

const { Item } = Form
const { Option } = Select
const { Text } = Typography

interface PreferencesSettingsProps {
  initialValues?: Record<string, any>
  onSave?: (values: Record<string, any>) => void
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  initialValues,
  onSave
}) => {
  const [form] = Form.useForm()

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      onSave?.(values)
      message.success('偏好設定已更新')
    } catch (error) {
      message.error('設定更新失敗')
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        style={{ maxWidth: 600 }}
      >
        {/* 外觀設定 */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
            <BgColorsOutlined style={{ marginRight: 'var(--spacing-xs)' }} />
            外觀設定
          </h3>
          <Item
            label="主題模式"
            name="theme"
          >
            <Select style={{ width: 200 }}>
              <Option value="dark">深色模式</Option>
              <Option value="light">淺色模式</Option>
              <Option value="auto">跟隨系統</Option>
            </Select>
          </Item>

          <Item
            label="主要顏色"
            name="primaryColor"
          >
            <Select style={{ width: 200 }}>
              <Option value="blue">藍色 (預設)</Option>
              <Option value="green">綠色</Option>
              <Option value="purple">紫色</Option>
              <Option value="orange">橙色</Option>
              <Option value="red">紅色</Option>
            </Select>
          </Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>緊湊模式</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                減少間距以顯示更多內容
              </Text>
            </div>
            <Item name="compactMode" valuePropName="checked" style={{ margin: 0 }}>
              <Switch />
            </Item>
          </div>
        </div>

        {/* 語言和地區 */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
            <GlobalOutlined style={{ marginRight: 'var(--spacing-xs)' }} />
            語言和地區
          </h3>
          <Item
            label="顯示語言"
            name="language"
          >
            <Select style={{ width: 200 }}>
              <Option value="zh-TW">繁體中文</Option>
              <Option value="zh-CN">簡體中文</Option>
              <Option value="en-US">English</Option>
              <Option value="ja-JP">日本語</Option>
            </Select>
          </Item>

          <Item
            label="時區"
            name="timezone"
          >
            <Select style={{ width: 200 }}>
              <Option value="Asia/Taipei">台北 (UTC+8)</Option>
              <Option value="Asia/Shanghai">上海 (UTC+8)</Option>
              <Option value="Asia/Tokyo">東京 (UTC+9)</Option>
              <Option value="America/New_York">紐約 (UTC-5)</Option>
              <Option value="Europe/London">倫敦 (UTC+0)</Option>
            </Select>
          </Item>

          <Item
            label="日期格式"
            name="dateFormat"
          >
            <Select style={{ width: 200 }}>
              <Option value="YYYY/MM/DD">YYYY/MM/DD</Option>
              <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
              <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
              <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
            </Select>
          </Item>
        </div>


        {/* 儀表板設定 */}
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
            <LayoutOutlined style={{ marginRight: 'var(--spacing-xs)' }} />
            儀表板偏好
          </h3>
          <Item
            label="預設頁面"
            name="defaultPage"
          >
            <Select style={{ width: 200 }}>
              <Option value="/">SRE 戰情室</Option>
              <Option value="/dashboard">儀表板管理</Option>
              <Option value="/incidents">事件管理</Option>
              <Option value="/resources">資源管理</Option>
              <Option value="/analyzing">分析中心</Option>
            </Select>
          </Item>

          <Item
            label="刷新間隔"
            name="refreshInterval"
          >
            <Select style={{ width: 200 }}>
              <Option value={30}>30 秒</Option>
              <Option value={60}>1 分鐘</Option>
              <Option value={300}>5 分鐘</Option>
              <Option value={600}>10 分鐘</Option>
              <Option value={0}>手動刷新</Option>
            </Select>
          </Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-md)' }}>
            <div>
              <Text strong>自動保存佈局</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                記住儀表板的自定義佈局
              </Text>
            </div>
            <Item name="autoSaveLayout" valuePropName="checked" style={{ margin: 0 }}>
              <Switch />
            </Item>
          </div>

          <div style={{ marginTop: 24 }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              儲存偏好設定
            </Button>
          </div>
        </div>
      </Form>
    </Space>
  )
}