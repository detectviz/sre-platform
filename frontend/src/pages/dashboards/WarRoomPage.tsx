import { Card, List, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useWarRoomDashboards } from '../../hooks';

export const WarRoomPage = () => {
  const { data, loading } = useWarRoomDashboards();
  const warRoom = data?.items?.[0];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        戰情室
      </Typography.Title>
      <Card bordered={false} loading={loading} title={warRoom?.name || '戰情室'}>
        <Typography.Paragraph>{warRoom?.description}</Typography.Paragraph>
        <Typography.Title level={5}>焦點事件</Typography.Title>
        <List
          dataSource={warRoom?.incident_focus || []}
          renderItem={(event) => (
            <List.Item key={event.id}>
              <List.Item.Meta title={event.summary} description={`嚴重性：${event.severity}`} />
              <Typography.Text>
                觸發時間：{event.triggered_at ? dayjs(event.triggered_at).format('YYYY/MM/DD HH:mm') : '-'}
              </Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};
