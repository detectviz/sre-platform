// 檔案: src/features/CapacityPlanning/CapacityForecastForm.tsx
// 描述: 容量預測功能的輸入表單元件。

import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { CapacityForecastRequest } from './types';

// 定義元件的 props 型別
interface CapacityForecastFormProps {
  // 當表單提交時要呼叫的回呼函式
  onSubmit: (values: CapacityForecastRequest) => void;
  // 標示目前是否正在載入，用於禁用表單
  isLoading: boolean;
}

const { Option } = Select;

/**
 * 容量預測表單元件
 * @param onSubmit - 表單提交時的回呼函式
 * @param isLoading - 是否處於載入狀態
 */
const CapacityForecastForm: React.FC<CapacityForecastFormProps> = ({ onSubmit, isLoading }) => {
  // 使用 Ant Design 的 Form hook 來管理表單狀態
  const [form] = Form.useForm();

  // 表單成功提交時的處理函式
  const onFinish = (values: any) => {
    // 將 resource_ids 從逗號分隔的字串轉換為字串陣列
    const resourceIds = values.resource_ids.split(',').map((id: string) => id.trim());

    // 呼叫父元件傳入的 onSubmit 函式
    onSubmit({
      resource_ids: resourceIds,
      metric_name: values.metric_name,
      forecast_period: values.forecast_period,
    });
  };

  return (
    <Form
      form={form}
      layout="inline" // 使用行內佈局，讓表單項水平排列
      onFinish={onFinish}
      initialValues={{ forecast_period: '30d', metric_name: 'cpu_usage' }} // 設定表單初始值
    >
      <Form.Item
        name="resource_ids"
        label="資源 ID"
        rules={[{ required: true, message: '請輸入資源 ID，以逗號分隔' }]}
      >
        <Input placeholder="例如: r_1, r_2" style={{ width: 240 }} disabled={isLoading} />
      </Form.Item>

      <Form.Item
        name="metric_name"
        label="監控指標"
        rules={[{ required: true, message: '請輸入指標名稱' }]}
      >
        <Input placeholder="例如: cpu_usage" style={{ width: 160 }} disabled={isLoading} />
      </Form.Item>

      <Form.Item
        name="forecast_period"
        label="預測期間"
        rules={[{ required: true, message: '請選擇預測期間' }]}
      >
        <Select style={{ width: 120 }} disabled={isLoading}>
          <Option value="7d">未來 7 天</Option>
          <Option value="30d">未來 30 天</Option>
          <Option value="90d">未來 90 天</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          開始分析
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CapacityForecastForm;
