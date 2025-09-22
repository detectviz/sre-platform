import React from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { EventFilters } from '../../hooks/useEvents';

const { Option } = Select;

interface EventFilterModalProps {
  open: boolean;
  onCancel: () => void;
  onApplyFilters: (filters: EventFilters) => void;
  initialFilters: EventFilters;
}

const EventFilterModal: React.FC<EventFilterModalProps> = ({ open, onCancel, onApplyFilters, initialFilters }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      onApplyFilters(values);
      onCancel(); // Close modal after applying
    });
  };

  return (
    <Modal
      title="搜索與篩選"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          套用
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={initialFilters}>
        <Form.Item name="q" label="統一搜索">
          <Input placeholder="搜尋事件 ID, 摘要, 資源名稱..." />
        </Form.Item>
        <Form.Item name="status" label="狀態">
          <Select placeholder="選擇狀態" allowClear>
            <Option value="new">New</Option>
            <Option value="ack">Acknowledged</Option>
            <Option value="resolved">Resolved</Option>
            <Option value="silence">Silenced</Option>
          </Select>
        </Form.Item>
        <Form.Item name="severity" label="嚴重程度">
          <Select placeholder="選擇嚴重程度" allowClear>
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventFilterModal;
