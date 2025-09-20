import { useEffect } from 'react';
import { Modal, Form, Input, Select, Spin, Alert, Typography, Tag, Divider, App } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import { fetchJson } from '../utils/apiClient';
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
  incidentId: string | null;
}

const DURATION_OPTIONS = [
  { label: '15 分鐘', value: '15m' },
  { label: '1 小時', value: '1h' },
  { label: '4 小時', value: '4h' },
  { label: '1 天', value: '1d' },
  { label: '7 天', value: '7d' },
];

const fetchEventByIncidentId = async (incidentId: string): Promise<Event> => {
  // Use incident_id query parameter for efficient filtering
  const response = await fetchJson<{ items: Event[] } | Event[]>(`/events?incident_id=${encodeURIComponent(incidentId)}`);

  // Handle both paginated and direct array responses
  const events = Array.isArray(response) ? response : response.items || [];

  if (events.length === 0) {
    throw new Error(`找不到與 incident ${incidentId} 相關的事件`);
  }

  // Return the first matching event (there should typically be one primary event per incident)
  return events[0];
};

export const CreateSilenceModal = ({ open, onCancel, onSuccess, incidentId }: CreateSilenceModalProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event-by-incident', incidentId],
    queryFn: () => fetchEventByIncidentId(incidentId!),
    enabled: !!incidentId && open, // Only fetch when the modal is open and has an incidentId
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
        if (!event?.id) return;
        createSilence({
          event_id: event.id, // Use the actual event ID from the fetched event
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
      className="silence-modal"
    >
      {isLoading ? (
        <Spin />
      ) : error ? (
        <Alert message={error instanceof Error ? error.message : '載入事件失敗'} type="error" />
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
            {event.tags.map((tag: { key: string; value: string; color?: string }) => (
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
