import { Card, Col, Row, Space, Typography } from 'antd';
import { useTopologies } from '../../hooks';

export const TopologyPage = () => {
  const { data, loading } = useTopologies();
  const topology = data?.items?.[0];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        拓撲視圖
      </Typography.Title>
      <Card bordered={false} loading={loading} title={topology?.name || '拓撲'}>
        <Typography.Paragraph>{topology?.description}</Typography.Paragraph>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Title level={5}>節點</Typography.Title>
            <ul>
              {topology?.nodes?.map((node) => (
                <li key={node.resource_id}>
                  {node.name}（{node.type}） - 狀態：{node.status}
                </li>
              ))}
            </ul>
          </Col>
          <Col span={12}>
            <Typography.Title level={5}>連線</Typography.Title>
            <ul>
              {topology?.edges?.map((edge) => (
                <li key={`${edge.source_id}-${edge.target_id}`}>
                  {edge.source_id} → {edge.target_id}（{edge.connection_type}）
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};
