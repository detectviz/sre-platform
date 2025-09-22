import React from 'react';
import { Space, Spin, Form, Select, Button, Card, Checkbox, Space as AntSpace } from 'antd';
import { PageHeader } from '../components/PageHeader';

const PreferenceSettingsPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [loading] = React.useState(false);
  const [form] = Form.useForm();

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入偏好設定資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="偏好設定"
        subtitle="用戶個性化操作體驗配置"
        description="設定介面主題、語言、時區等個人偏好。"
      />

      <Card title="偏好設定" style={{ width: '100%' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="介面主題"
            name="theme"
          >
            <Select placeholder="選擇主題">
              <Select.Option value="light">淺色</Select.Option>
              <Select.Option value="dark">深色</Select.Option>
              <Select.Option value="auto">自動</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="預設頁面"
            name="default_page"
          >
            <Select placeholder="選擇預設頁面">
              <Select.Option value="warroom">SRE 戰情室</Select.Option>
              <Select.Option value="incidents">事件管理</Select.Option>
              <Select.Option value="resources">資源管理</Select.Option>
              <Select.Option value="dashboard">儀表板管理</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="語言"
            name="language"
          >
            <Select placeholder="選擇語言">
              <Select.Option value="zh-tw">繁體中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="時區"
            name="timezone"
          >
            <Select placeholder="選擇時區">
              <Select.Option value="Asia/Taipei">Asia/Taipei</Select.Option>
              <Select.Option value="UTC">UTC</Select.Option>
              <Select.Option value="America/New_York">America/New_York</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="通知偏好"
            name="notifications"
          >
            <Checkbox.Group>
              <AntSpace direction="vertical">
                <Checkbox value="email" name="email_notification">郵件通知</Checkbox>
                <Checkbox value="slack" name="slack_notification">Slack 通知</Checkbox>
                <Checkbox value="merge" name="merge_notification">合併通知</Checkbox>
              </AntSpace>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            label="顯示設定"
            name="display"
          >
            <Checkbox.Group>
              <AntSpace direction="vertical">
                <Checkbox value="animation" name="animation">顯示動畫效果</Checkbox>
                <Checkbox value="tooltips" name="tooltips">顯示工具提示</Checkbox>
                <Checkbox value="compact" name="compact_mode">緊湊模式</Checkbox>
              </AntSpace>
            </Checkbox.Group>
          </Form.Item>

          <Space>
            <Button>重置為預設</Button>
            <Button type="primary">儲存偏好設定</Button>
            <Button>預覽變更</Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );
};

export default PreferenceSettingsPage;
