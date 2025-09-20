import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Spin, Alert, Typography, Tag, Divider, App } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../utils/apiClient';
import { useCreateSilence } from '../hooks/useCreateSilence';

const { Text, Title } = Typography;

interface Event {
  id: string;
  summary: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  tags: { key: string; value: string; color?: string }[];
}

interface CreateSilenceModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  eventId: string | null;
}

const DURATION_OPTIONS = [
  { label: '15 分鐘', value: '15m' },
  { label: '1 小時', value: '1h' },
  { label: '4 小時', value: '4h' },
  { label: '1 天', value: '1d' },
  { label: '7 天', value: '7d' },
];

const fetchEvent = async (eventId: string) => {
  const { data } = await apiClient.get(`/events/${eventId}`);
  return data;
};

export const CreateSilenceModal = ({ open, onCancel, onSuccess, eventId }: CreateSilenceModalProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: event, isLoading, error, isFetching } = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId!),
    enabled: !!eventId && open, // Only fetch when the modal is open and has an eventId
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { mutate: createSilence, isPending: isSubmitting } = useCreateSilence();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        if (!eventId) return;
        createSilence({
          event_id: eventId,
          duration: values.duration,
          comment: values.comment,
        }, {
          onSuccess: () => {
            message.success('靜音規則已成功建立');
            onSuccess();
          },
          onError: (err) => {
            message.error(`建立靜音規則失敗: ${err.message}`);
          },
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const renderSeverityTag = (severity: string) => {
    const color = severity === 'CRITICAL' ? 'volcano' : severity === 'WARNING' ? 'orange' : 'blue';
    return <Tag color={color}>{severity}</Tag>;
  };

  return (
    <Modal
      title={<><BellOutlined /> 建立靜音規則</>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText="建立靜音"
      cancelText="取消"
      width={600}
    >
      {isLoading ? (
        <Spin />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : event ? (
        <Form form={form} layout="vertical" name="create_silence_form">
          <Title level={5}>事件資訊</Title>
          <Text strong>{event.summary}</Text>
          <div style={{ margin: '8px 0' }}>
            {renderSeverityTag(event.severity)}
          </div>

          <Divider />

          <Title level={5}>靜音匹配條件 (從事件標籤自動帶入)</Title>
          <div>
            {event.tags.map(tag => (
              <Tag key={`${tag.key}:${tag.value}`} color={tag.color || 'default'}>
                {tag.key}={tag.value}
              </Tag>
            ))}
          </div>

          <Divider />

          <Title level={5}>靜音設定</Title>
          <Form.Item
            name="duration"
            label="靜音時長"
            rules={[{ required: true, message: '請選擇或輸入靜音時長!' }]}
            initialValue="1h"
          >
            <Select options={DURATION_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="comment"
            label="原因 (必填)"
            rules={[{ required: true, message: '請輸入建立此靜音規則的原因!' }]}
          >
            <Input.TextArea rows={4} placeholder="例如：正在進行計畫性維護，暫時靜音相關告警。" />
          </Form.Item>
        </Form>
      ) : (
        <Text>沒有可用的事件資訊。</Text>
      )}
    </Modal>
  );
};
