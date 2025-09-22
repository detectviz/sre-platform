import { Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useResourceGroups } from '../../hooks';
import type { ResourceGroup } from '../../hooks';

// 資源群組頁面，聚焦於群組的健康狀態與成員資訊
export const ResourceGroupPage = () => {
  const { data, loading } = useResourceGroups();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        資源群組
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {(data?.items || []).map((group: ResourceGroup) => (
          <Col span={12} key={group.id || group.name}>
            <Card title={group.name || '未命名群組'} bordered={false} loading={loading}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Typography.Paragraph type="secondary">
                  {group.description || '暫無描述'}
                </Typography.Paragraph>
                <Space size={[8, 8]} wrap>
                  <Tag color="blue">狀態：{group.status || '未知'}</Tag>
                  <Tag color="geekblue">擁有團隊：{group.owner_team || '未設定'}</Tag>
                  <Tag color="purple">資源數量：{group.resource_ids?.length || 0}</Tag>
                </Space>
                <Typography.Text type="secondary">
                  最後更新：
                  {group.updated_at ? new Date(group.updated_at).toLocaleString() : '—'}
                </Typography.Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      {(data?.items?.length || 0) === 0 && !loading && (
        <Card bordered={false}>
          <Typography.Paragraph>尚未建立任何資源群組。</Typography.Paragraph>
        </Card>
      )}
    </Space>
  );
};
