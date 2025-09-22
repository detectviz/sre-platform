import { useState } from 'react';
import {
  Select,
  Space,
  Typography,
  Row,
  Col,
  Card,
  Alert,
  Statistic,
  Empty,
  Button,
  Progress,
  Divider,
} from 'antd';
import { SaveOutlined, PieChartOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PageHeader } from '../components';
import { useCapacityPlanning } from '../hooks/useCapacityPlanning';
import { ForecastChart } from './capacity-planning/ForecastChart';

const { Title, Text, Paragraph } = Typography;

const CapacityPlanningPage = () => {
  const [selectedService, setSelectedService] = useState<string | null>('service-a');
  const { data, loading, error, services } = useCapacityPlanning(selectedService);

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
  };

  const renderContent = () => {
    if (loading) {
      return null; // Charts have their own loading spinners
    }

    if (error) {
      return <Alert message="讀取容量規劃資料時發生錯誤" description={error.message} type="error" showIcon />;
    }

    if (!selectedService) {
      return (
        <Empty
          image={<PieChartOutlined style={{ fontSize: 60, color: 'var(--sre-text-color-secondary)' }} />}
          description={
            <Space direction="vertical" align="center">
              <Title level={5}>請選擇一個服務以開始</Title>
              <Text>選擇一個服務以查看其資源使用趨勢與容量預測。</Text>
            </Space>
          }
        />
      );
    }

    if (!data) {
      return <Empty description="找不到所選服務的資料" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="CPU 使用率預測" data={data.cpu} loading={loading} />
              <Alert message={data.cpu.recommendation} type="warning" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="記憶體使用率預測" data={data.memory} loading={loading} />
              <Alert message={data.memory.recommendation} type="info" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <ForecastChart title="磁碟使用率預測" data={data.disk} loading={loading} />
              <Alert message={data.disk.recommendation} type="error" showIcon style={{ marginTop: 16 }} />
            </Card>
          </Col>
        </Row>
        <Card>
          <Title level={4}>服務容量分析</Title>
          <Row gutter={[32, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="目前負載 / 容量上限 (RPS)"
                value={data.capacityAnalysis.currentLoad}
                suffix={`/ ${data.capacityAnalysis.capacityLimit}`}
              />
              <Progress
                percent={(data.capacityAnalysis.currentLoad / data.capacityAnalysis.capacityLimit) * 100}
                showInfo={false}
                strokeColor={{
                  '0%': '#87d068',
                  '50%': '#fadb14',
                  '100%': '#f5222d',
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="當前瓶頸"
                value={data.capacityAnalysis.bottleneck}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
          </Row>
          <Divider />
          <Title level={5}>擴容建議</Title>
          <Paragraph>
            <ul>
              {data.capacityAnalysis.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </Paragraph>
          <Button type="primary" icon={<ThunderboltOutlined />}>執行自動擴容腳本 (模擬)</Button>
        </Card>
      </Space>
    );
  };

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <PageHeader
        title="容量規劃"
        subtitle="預測資源使用趨勢，主動應對未來需求"
        extra={[
          <Select
            key="service-select"
            style={{ width: 220 }}
            placeholder="請選擇服務"
            value={selectedService}
            onChange={handleServiceChange}
            options={services.map((s: { id: string; name: string }) => ({ value: s.id, label: s.name }))}
            allowClear
          />,
          <Button key="save-report" icon={<SaveOutlined />}>
            儲存分析報告
          </Button>,
        ]}
      />
      {renderContent()}
    </Space>
  );
};

export default CapacityPlanningPage;
