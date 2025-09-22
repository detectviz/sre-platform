import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  BellOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

import { fetchJson } from '../utils/apiClient';
import { GlassModal } from './GlassModal';
import { useCreateSilence } from '../hooks/useCreateSilence';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const DURATION_OPTIONS = [
  { label: '15 分鐘', value: '15m' },
  { label: '1 小時', value: '1h' },
  { label: '4 小時', value: '4h' },
  { label: '1 天', value: '1d' },
  { label: '7 天', value: '7d' },
];

const REMINDER_OPTIONS = [
  { label: '到期前 5 分鐘', value: '5m' },
  { label: '到期前 15 分鐘', value: '15m' },
  { label: '到期前 30 分鐘', value: '30m' },
  { label: '到期前 1 小時', value: '60m' },
  { label: '不需要提醒', value: 'none' },
];

const MATCHER_OPERATORS = [
  { label: '等於 (=)', value: 'eq' },
  { label: '不等於 (!=)', value: 'neq' },
  { label: '包含於 (in)', value: 'in' },
  { label: '不包含 (not in)', value: 'not_in' },
  { label: '符合正則 (=~)', value: 'regex' },
  { label: '不符合正則 (!~)', value: 'not_regex' },
];

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: '緊急', color: 'volcano' },
  ERROR: { label: '錯誤', color: 'magenta' },
  WARNING: { label: '警告', color: 'gold' },
  INFO: { label: '資訊', color: 'geekblue' },
};

type EventTag = { key: string; value: string; color?: string };

type IncidentEvent = {
  id: string;
  summary: string;
  severity: string;
  status?: string;
  service?: string;
  owner_team?: string;
  last_triggered_at?: string;
  active_notifications?: number;
  impacted_resources?: number;
  tags: EventTag[];
};

type MatcherFormValue = {
  key?: string;
  operator?: string;
  values?: string[];
};

type SilencePreview = {
  affected_series_count?: number;
  impacted_channels?: string[];
  related_teams?: string[];
  recommended_ends_at?: string;
};

interface CreateSilenceModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  incidentId: string | null;
}

const fetchEventByIncidentId = async (incidentId: string): Promise<IncidentEvent> => {
  const response = await fetchJson<{ items: IncidentEvent[] } | IncidentEvent[]>(`/events?incident_id=${encodeURIComponent(incidentId)}`);
  const events = Array.isArray(response) ? response : response.items || [];

  if (events.length === 0) {
    throw new Error(`找不到與 incident ${incidentId} 相關的事件`);
  }

  return events[0];
};

const fetchSilencePreview = async (
  incidentId: string,
  matchers: Array<{ key: string; operator: string; values: string[] }>,
): Promise<SilencePreview> => {
  try {
    return await fetchJson<SilencePreview>(`/silence-rules/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incident_id: incidentId, matchers }),
    });
  } catch (previewError) {
    console.warn('[CreateSilenceModal] 影響預覽 API 無法取得，使用預設資料。', previewError);
    return {
      affected_series_count: matchers.length * 2 || 1,
      related_teams: [],
      impacted_channels: [],
    };
  }
};

const buildInitialMatchers = (event?: IncidentEvent): MatcherFormValue[] => {
  if (!event?.tags || event.tags.length === 0) {
    return [];
  }
  return event.tags.map((tag) => ({
    key: tag.key,
    operator: 'eq',
    values: [tag.value],
  }));
};

const sanitizeMatchers = (values: MatcherFormValue[] | undefined) => {
  if (!Array.isArray(values)) {
    return [] as Array<{ key: string; operator: string; values: string[] }>;
  }

  return values
    .map((matcher) => {
      const key = matcher.key?.trim();
      const operator = matcher.operator && matcher.operator.length > 0 ? matcher.operator : 'eq';
      const rawValues = Array.isArray(matcher.values)
        ? matcher.values
        : [];
      const sanitizedValues = rawValues
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value));

      if (!key || sanitizedValues.length === 0) {
        return null;
      }

      return {
        key,
        operator,
        values: sanitizedValues,
      };
    })
    .filter((matcher): matcher is { key: string; operator: string; values: string[] } => Boolean(matcher));
};

const parseDurationToEndTime = (duration?: string) => {
  if (!duration) {
    return null;
  }
  const match = duration.trim().match(/^(\d+)\s*([smhdw])$/i);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  switch (unit) {
    case 's':
      return dayjs().add(value, 'second');
    case 'm':
      return dayjs().add(value, 'minute');
    case 'h':
      return dayjs().add(value, 'hour');
    case 'd':
      return dayjs().add(value, 'day');
    case 'w':
      return dayjs().add(value, 'week');
    default:
      return null;
  }
};

export const CreateSilenceModal = ({ open, onCancel, onSuccess, incidentId }: CreateSilenceModalProps) => {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data: event, isLoading, error } = useQuery<IncidentEvent>({
    queryKey: ['event-by-incident', incidentId],
    queryFn: () => fetchEventByIncidentId(incidentId!),
    enabled: Boolean(incidentId) && open,
    staleTime: 5 * 60 * 1000,
  });

  const matchers = Form.useWatch<MatcherFormValue[]>('matchers', form);
  const durationValue = Form.useWatch<string>('duration', form);
  const sanitizedMatchers = useMemo(() => sanitizeMatchers(matchers), [matchers]);

  const { data: preview, isFetching: previewLoading } = useQuery({
    queryKey: ['silence-preview', incidentId, sanitizedMatchers],
    queryFn: () => fetchSilencePreview(incidentId!, sanitizedMatchers),
    enabled: Boolean(incidentId) && open && sanitizedMatchers.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const estimatedEndTime = useMemo(() => parseDurationToEndTime(durationValue), [durationValue]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setAdvancedOpen(false);
      return;
    }
    form.setFieldsValue({
      duration: '1h',
      reminder: '15m',
      comment: '',
      matchers: buildInitialMatchers(event),
    });
  }, [open, event, form]);

  const { mutate: createSilence, isPending: isSubmitting } = useCreateSilence();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!event?.id) {
        return;
      }
      const payload = {
        event_id: event.id,
        duration: values.duration,
        comment: values.comment,
        matchers: sanitizedMatchers,
        reminder_offset: values.reminder && values.reminder !== 'none' ? values.reminder : null,
      };

      createSilence(payload, {
        onSuccess: () => {
          message.success('靜音規則已成功建立');
          onSuccess();
        },
        onError: (err) => {
          message.error(`建立靜音規則失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
        },
      });
    } catch (validationError) {
      console.warn('[CreateSilenceModal] 表單驗證失敗', validationError);
    }
  };

  const severityMeta = SEVERITY_META[event?.severity?.toUpperCase() ?? 'INFO'] ?? SEVERITY_META.INFO;
  const matcherTags = sanitizedMatchers.length > 0
    ? sanitizedMatchers.flatMap((matcher) => matcher.values.map((value) => (
      <Tag key={`${matcher.key}:${value}`} color="geekblue" style={{ marginBottom: 4 }}>
        {matcher.key} {matcher.operator === 'eq' ? '=' : matcher.operator} {value}
      </Tag>
    )))
    : [<Tag key="empty" color="default">尚未設定條件</Tag>];

  return (
    <GlassModal
      title={(
        <Space align="center" size={8}>
          <BellOutlined />
          <span>建立靜音規則</span>
          {event?.summary && (
            <Text type="secondary" style={{ fontSize: 14 }}>
              {event.summary}
            </Text>
          )}
        </Space>
      )}
      open={open}
      width={920}
      okText="建立靜音"
      cancelText="取消"
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <Spin tip="載入事件資訊中" />
        </div>
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="無法載入事件資料"
          description={error instanceof Error ? error.message : '請稍後再試'}
        />
      ) : event ? (
        <Form form={form} layout="vertical" requiredMark={false}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                  size="small"
                  bordered={false}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 16 }}
                  bodyStyle={{ padding: 20 }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Space align="center" size={12}>
                      <Tag color={severityMeta.color} style={{ marginBottom: 0 }}>
                        {severityMeta.label}
                      </Tag>
                      <Text strong>{event.summary}</Text>
                    </Space>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Text type="secondary">事件狀態</Text>
                        <div>{event.status ?? '未提供'}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">責任團隊</Text>
                        <div>{event.owner_team ?? '未指定'}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">觸發服務</Text>
                        <div>{event.service ?? '未提供'}</div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">最近通知</Text>
                        <div>{event.last_triggered_at ? dayjs(event.last_triggered_at).fromNow?.() ?? event.last_triggered_at : '—'}</div>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                <div>
                  <Space align="baseline" size={8}>
                    <Title level={5} style={{ marginBottom: 8 }}>靜音匹配條件</Title>
                    <Tooltip title="從事件標籤自動產生，可依需求調整">
                      <ExclamationCircleOutlined style={{ color: 'var(--text-tertiary)' }} />
                    </Tooltip>
                  </Space>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Space wrap>{matcherTags}</Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => setAdvancedOpen((prev) => !prev)}>
                      {advancedOpen ? '收合進階編輯' : '進階編輯條件'}
                    </Button>
                  </Space>
                </div>

                <Collapse
                  activeKey={advancedOpen ? ['advanced'] : []}
                  onChange={(keys) => setAdvancedOpen(keys.length > 0)}
                  ghost
                >
                  <Panel header="進階條件設定" key="advanced">
                    <Form.List name="matchers">
                      {(fields, { add, remove }) => (
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          {fields.map((field) => (
                            <Row gutter={8} key={field.key} align="middle">
                              <Col xs={24} md={7}>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'key']}
                                  fieldKey={[field.fieldKey, 'key']}
                                  rules={[{ required: true, message: '請輸入標籤鍵' }]}
                                >
                                  <Input placeholder="標籤鍵 (例如：alertname)" />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={7}>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'operator']}
                                  fieldKey={[field.fieldKey, 'operator']}
                                  initialValue="eq"
                                >
                                  <Select options={MATCHER_OPERATORS} />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={8}>
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'values']}
                                  fieldKey={[field.fieldKey, 'values']}
                                  rules={[{ required: true, message: '請輸入至少一個值' }]}
                                >
                                  <Select
                                    mode="tags"
                                    tokenSeparators={[',', ' ']}
                                    placeholder="輸入匹配值"
                                  />
                                </Form.Item>
                              </Col>
                              <Col xs={24} md={2}>
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => remove(field.name)}
                                />
                              </Col>
                            </Row>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add({ operator: 'eq', values: [] })}
                            block
                          >
                            新增條件
                          </Button>
                        </Space>
                      )}
                    </Form.List>
                  </Panel>
                </Collapse>

                <Divider orientation="left" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Text strong>靜音設定</Text>
                </Divider>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="duration"
                      label="靜音時長"
                      rules={[{ required: true, message: '請輸入靜音時長，例如 1h 或 30m' }]}
                      extra={(
                        <Space wrap>
                          {DURATION_OPTIONS.map((option) => (
                            <Button
                              key={option.value}
                              size="small"
                              type={durationValue === option.value ? 'primary' : 'default'}
                              ghost={durationValue !== option.value}
                              onClick={() => form.setFieldsValue({ duration: option.value })}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </Space>
                      )}
                    >
                      <Input placeholder="支援 15m、1h、1d 等格式" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="reminder"
                      label="到期提醒"
                    >
                      <Select options={REMINDER_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="comment"
                  label="靜音原因"
                  rules={[{ required: true, message: '請輸入建立靜音的原因，便於後續審計追蹤' }]}
                >
                  <Input.TextArea
                    rows={4}
                    showCount
                    maxLength={280}
                    placeholder="例如：值班團隊正在處理磁碟擴容，避免重複通知。"
                  />
                </Form.Item>
              </Space>
            </Col>

            <Col xs={24} lg={10}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                  size="small"
                  title="靜音影響預覽"
                  extra={<Text type="secondary">模擬結果</Text>}
                  style={{ borderRadius: 16 }}
                >
                  {previewLoading ? (
                    <Spin />
                  ) : (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      <Statistic
                        title="可能影響的告警"
                        value={preview?.affected_series_count ?? (sanitizedMatchers.length > 0 ? sanitizedMatchers.length : 0)}
                        suffix="筆"
                        valueStyle={{ color: '#fff' }}
                      />
                      <Space direction="vertical" size={8}>
                        <Text type="secondary">受影響的通知管道</Text>
                        <Space wrap>
                          {(preview?.impacted_channels && preview.impacted_channels.length > 0)
                            ? preview.impacted_channels.map((channel) => (
                              <Tag key={channel} color="purple">{channel}</Tag>
                            ))
                            : <Text type="secondary">尚無影響預估</Text>}
                        </Space>
                      </Space>
                      <Space direction="vertical" size={8}>
                        <Text type="secondary">相關團隊</Text>
                        <Space wrap>
                          {(preview?.related_teams && preview.related_teams.length > 0)
                            ? preview.related_teams.map((team) => (
                              <Tag key={team} color="geekblue">{team}</Tag>
                            ))
                            : <Text type="secondary">尚無關聯團隊</Text>}
                        </Space>
                      </Space>
                    </Space>
                  )}
                </Card>

                <Card size="small" title="提交流程檢查" style={{ borderRadius: 16 }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text>確認靜音原因已說明操作背景與恢復計畫。</Text>
                    </Space>
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text>通知值班人員靜音生效期間可能忽略的事件。</Text>
                    </Space>
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Text>必要時在靜音到期前於 #incident-bridge 頻道提醒相關團隊。</Text>
                    </Space>
                  </Space>
                </Card>

                <Card size="small" title="事件時間軸" style={{ borderRadius: 16 }}>
                  <Timeline
                    mode="left"
                    items={[
                      {
                        label: '現在',
                        children: '建立靜音規則',
                      },
                      {
                        label: '最近通知',
                        children: event.last_triggered_at
                          ? dayjs(event.last_triggered_at).format('YYYY-MM-DD HH:mm')
                          : '無資料',
                      },
                      {
                        label: '預估結束',
                        children: estimatedEndTime
                          ? `${estimatedEndTime.format('YYYY-MM-DD HH:mm')} (${estimatedEndTime.fromNow?.() ?? ''})`
                          : '請輸入合法的時長以計算結束時間',
                      },
                    ]}
                  />
                </Card>
              </Space>
            </Col>
          </Row>
        </Form>
      ) : (
        <Text>沒有可用的事件資訊。</Text>
      )}
    </GlassModal>
  );
};

export default CreateSilenceModal;
