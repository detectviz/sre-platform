import React from 'react'
import { Card, Form, Select, Switch, Space, Button, Typography, message } from 'antd'
import {
  BgColorsOutlined,
  GlobalOutlined,
  BellOutlined,
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
      >
        {/* 外觀設定 */}
        <Card
          title={
            <Space>
              <BgColorsOutlined />
              <span>外觀設定</span>
            </Space>
          }
          size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
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
          </Space>
        </Card>

        {/* 語言和地區 */}
        <Card
          title={
            <Space>
              <GlobalOutlined />
              <span>語言和地區</span>
            </Space>
          }
          size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
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
          </Space>
        </Card>

        {/* 通知設定 */}
        <Card
          title={
            <Space>
              <BellOutlined />
              <span>通知偏好</span>
            </Space>
          }
          size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>桌面通知</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  在瀏覽器中顯示通知
                </Text>
              </div>
              <Item name="desktopNotifications" valuePropName="checked" style={{ margin: 0 }}>
                <Switch />
              </Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>聲音提醒</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  播放通知聲音
                </Text>
              </div>
              <Item name="soundNotifications" valuePropName="checked" style={{ margin: 0 }}>
                <Switch />
              </Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>電子郵件摘要</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  每日發送活動摘要
                </Text>
              </div>
              <Item name="emailDigest" valuePropName="checked" style={{ margin: 0 }}>
                <Switch />
              </Item>
            </div>
          </Space>
        </Card>

        {/* 儀表板設定 */}
        <Card
          title={
            <Space>
              <LayoutOutlined />
              <span>儀表板偏好</span>
            </Space>
          }
          size="small"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          </Space>
        </Card>

        <div style={{ marginTop: 24 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
          >
            儲存偏好設定
          </Button>
        </div>
      </Form>
    </Space>
  )
}