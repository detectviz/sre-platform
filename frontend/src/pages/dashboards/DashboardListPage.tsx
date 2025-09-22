import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useDashboards } from '../../hooks';

export const DashboardListPage = () => {
  const { data, loading } = useDashboards();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        儀表板列表
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {data?.items?.map((dashboard) => (
          <Col key={dashboard.id} xs={24} md={12} lg={8}>
            <Card loading={loading} title={dashboard.name} bordered={false}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Typography.Text type="secondary">{dashboard.description}</Typography.Text>
                <Space wrap>
                  <Tag color="blue">{dashboard.category}</Tag>
                  {dashboard.tags?.map((tag) => (
                    <Tag key={`${dashboard.id}-${tag}`}>{tag}</Tag>
                  ))}
                </Space>
                <Statistic title="瀏覽數" value={dashboard.view_count} />
                <Statistic title="收藏數" value={dashboard.favorite_count} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
};
