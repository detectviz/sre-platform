import { Card, List, Space, Typography } from 'antd';
import { useInsights } from '../../hooks';

export const InsightPage = () => {
  const { data, loading } = useInsights();
  const insight = data?.items?.[0];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        洞察儀表板
      </Typography.Title>
      <Card bordered={false} loading={loading} title={insight?.name || '洞察'}>
        <Typography.Paragraph>{insight?.insight_summary}</Typography.Paragraph>
        <List
          dataSource={insight?.key_metrics || []}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={`指標值：${item.value}`} />
              <Typography.Text>趨勢：{item.trend}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
};
