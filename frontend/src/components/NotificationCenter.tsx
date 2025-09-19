import { BellOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { App as AntdApp, Avatar, Badge, Button, Divider, Empty, List, Popover, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import fallbackData from '../mocks/db.json';

dayjs.extend(relativeTime);

type NotificationRecord = {
  id: string;
  event_id?: string | null;
  policy_id?: string | null;
  channel_name: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string | null;
  raw_payload?: Record<string, unknown>;
  sent_at?: string | null;
  created_at?: string;
};

const STATUS_TONE: Record<NotificationRecord['status'], { color: string; icon: JSX.Element }> = {
  pending: { color: 'var(--brand-info)', icon: <InfoCircleOutlined /> },
  sent: { color: 'var(--brand-primary)', icon: <InfoCircleOutlined /> },
  delivered: { color: 'var(--brand-success)', icon: <CheckCircleOutlined /> },
  failed: { color: 'var(--brand-danger)', icon: <ExclamationCircleOutlined /> },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api/v1';

export const NotificationCenter = () => {
  const { message } = AntdApp.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const unreadCount = records.filter((record) => !readIds.has(record.id) && record.status !== 'delivered').length;

  useEffect(() => {
    if (!open || records.length > 0) return;

    const controller = new AbortController();

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/notification-history?page_size=10`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error('無法取得通知歷史');
        }
        const data = await res.json();
        const items: NotificationRecord[] = Array.isArray(data.items) ? data.items : data;
        setRecords(items);
      } catch (err) {
        if ((err as { name?: string }).name !== 'AbortError') {
          message.warning('使用內建通知資料');
          const fallback = (fallbackData.notification_history as NotificationRecord[]).slice(0, 6);
          setRecords(fallback);
        }
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
    return () => controller.abort();
  }, [open, records.length]);

  const handleMarkAllAsRead = () => {
    setReadIds(new Set(records.map((record) => record.id)));
  };

  const handleItemClick = (record: NotificationRecord) => {
    setReadIds((prev) => new Set(prev).add(record.id));
    if (record.event_id) {
      message.info(`前往事件 ${record.event_id}`);
    }
  };

  const content = (
    <div className="notification-dropdown">
      <div className="notification-dropdown__header">
        <Space align="center" size={12}>
          <div className="notification-dropdown__icon">
            <BellOutlined style={{ fontSize: 16, color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>通知中心</Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {unreadCount > 0 ? `${unreadCount} 則未讀通知` : '沒有新通知'}
            </Typography.Text>
          </div>
        </Space>
        {unreadCount > 0 && (
          <Button type="text" size="small" onClick={handleMarkAllAsRead}>
            全部已讀
          </Button>
        )}
      </div>
      <Divider style={{ margin: 0 }} />
      <div className="notification-dropdown__body">
        {loading ? (
          <div className="notification-dropdown__empty"><Spin /></div>
        ) : records.length === 0 ? (
          <div className="notification-dropdown__empty">
            <Empty description="目前沒有通知" imageStyle={{ filter: 'brightness(0.8)' }} />
          </div>
        ) : (
          <List
            dataSource={records}
            renderItem={(item) => {
              const tone = STATUS_TONE[item.status] ?? STATUS_TONE.sent;
              const isRead = readIds.has(item.id) || item.status === 'delivered';
              return (
                <List.Item
                  className={`notification-dropdown__item ${isRead ? '' : 'notification-dropdown__item--unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={36}
                        icon={tone.icon}
                        style={{
                          backgroundColor: `${tone.color}15`,
                          color: tone.color,
                          border: `1px solid ${tone.color}30`,
                        }}
                      />
                    }
                    title={
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{item.channel_name}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(item.sent_at || item.created_at).fromNow()}
                        </Typography.Text>
                      </Space>
                    }
                    description={
                      <Typography.Text type="secondary">
                        {item.status === 'failed' && item.error_message
                          ? item.error_message
                          : item.recipient}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <Popover
      overlayClassName="notification-dropdown__popover"
      placement="bottomRight"
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} size="small">
        <Button type="text" icon={<BellOutlined />} aria-label="通知中心" />
      </Badge>
    </Popover>
  );
};

export default NotificationCenter;
