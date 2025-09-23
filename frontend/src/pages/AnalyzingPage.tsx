import React, { useState } from 'react'
import { useTabs } from '../hooks'
import { Typography, Space, Tabs, Table, Card, Progress, Alert, Button, Select, DatePicker } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import { PageLayout } from '../components/PageLayout'
import {
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

const AnalyzingPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('capacity', {
    capacity: '/analyzing/capacity',
    trends: '/analyzing/trends',
    predictions: '/analyzing/predictions',
  })

  // 狀態管理
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedModel, setSelectedModel] = useState('linear')

  // 工具列操作處理
  const handleRefresh = () => {
    console.log('刷新分析數據')
  }

  const handleSearch = () => {
    console.log('打開搜索篩選')
  }

  const handleExport = () => {
    console.log('導出分析報告')
  }

  const handleAIAnalysis = () => {
    console.log('觸發 AI 分析')
  }

  // 容量分析數據
  const capacityData = [
    { resource: 'Web 集群', current: 65, forecast: 78, recommended: 80 },
    { resource: '資料庫集群', current: 72, forecast: 85, recommended: 90 },
    { resource: '快取服務', current: 45, forecast: 52, recommended: 60 },
    { resource: 'API 服務', current: 58, forecast: 68, recommended: 70 },
  ]

  // 資源負載分析數據
  const resourceLoadData = [
    {
      resource: 'web-server-01',
      avgCpu: 68.5,
      avgMemory: 72.3,
      diskRead: 245.6,
      diskWrite: 156.8,
      netIn: 89.2,
      netOut: 67.5,
      anomalyCount: 3
    },
    {
      resource: 'db-server-01',
      avgCpu: 45.2,
      avgMemory: 58.7,
      diskRead: 123.4,
      diskWrite: 98.1,
      netIn: 45.8,
      netOut: 34.2,
      anomalyCount: 1
    },
    {
      resource: 'cache-server-01',
      avgCpu: 32.1,
      avgMemory: 41.5,
      diskRead: 78.9,
      diskWrite: 65.4,
      netIn: 23.7,
      netOut: 18.9,
      anomalyCount: 0
    },
  ]

  const resourceLoadColumns: ColumnsType<typeof resourceLoadData[0]> = [
    { title: '資源名稱', dataIndex: 'resource', key: 'resource', sorter: true },
    {
      title: 'CPU 使用率',
      dataIndex: 'avgCpu',
      key: 'avgCpu',
      render: (value) => (
        <div>
          <Progress percent={value} size="small" status={value > 80 ? 'exception' : 'normal'} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}%</span>
        </div>
      ),
      sorter: (a, b) => a.avgCpu - b.avgCpu
    },
    {
      title: '記憶體使用率',
      dataIndex: 'avgMemory',
      key: 'avgMemory',
      render: (value) => (
        <div>
          <Progress percent={value} size="small" status={value > 80 ? 'exception' : 'normal'} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}%</span>
        </div>
      ),
      sorter: (a, b) => a.avgMemory - b.avgMemory
    },
    {
      title: '磁碟讀取',
      dataIndex: 'diskRead',
      key: 'diskRead',
      render: (value) => `${value} MB/s`,
      sorter: (a, b) => a.diskRead - b.diskRead
    },
    {
      title: '磁碟寫入',
      dataIndex: 'diskWrite',
      key: 'diskWrite',
      render: (value) => `${value} MB/s`,
      sorter: (a, b) => a.diskWrite - b.diskWrite
    },
    {
      title: '網路輸入',
      dataIndex: 'netIn',
      key: 'netIn',
      render: (value) => `${value} Mbps`,
      sorter: (a, b) => a.netIn - b.netIn
    },
    {
      title: '網路輸出',
      dataIndex: 'netOut',
      key: 'netOut',
      render: (value) => `${value} Mbps`,
      sorter: (a, b) => a.netOut - b.netOut
    },
    {
      title: '異常次數',
      dataIndex: 'anomalyCount',
      key: 'anomalyCount',
      render: (value) => (
        <span style={{
          color: value > 0 ? 'var(--brand-danger)' : 'var(--text-secondary)',
          fontWeight: value > 0 ? 600 : 'normal'
        }}>
          {value}
        </span>
      ),
      sorter: (a, b) => a.anomalyCount - b.anomalyCount
    },
  ]

  // AI 洞察數據
  const aiInsightData = [
    {
      title: '系統效能預測',
      content: '預計未來 7 天內系統整體效能將維持在 85% 以上，無重大風險。',
      confidence: 92,
      impact: 'low'
    },
    {
      title: '資源擴容建議',
      content: 'Web 集群資源使用率已達 78%，建議提前擴容以應對流量高峰。',
      confidence: 87,
      impact: 'medium'
    },
    {
      title: '異常模式識別',
      content: '檢測到資料庫延遲偶爾出現異常峰值，建議檢查慢查詢日誌。',
      confidence: 78,
      impact: 'high'
    },
  ]

  const kpiData = [
    {
      title: '系統容量利用率',
      value: '68.5%',
      description: '當前整體資源使用率',
      trend: '+5.2%',
      status: 'info' as const,
    },
    {
      title: '趨勢預測準確度',
      value: '89.3%',
      description: '機器學習預測準確率',
      trend: '+3.1%',
      status: 'success' as const,
    },
    {
      title: '異常檢測',
      value: '12',
      description: '今日檢測到的異常事件',
      trend: '-2',
      status: 'warning' as const,
    },
    {
      title: '效能分析報告',
      value: '47',
      description: '本月產生的分析報告',
      trend: '+8',
      status: 'info' as const,
    },
  ]

  const tabItems = [
    {
      key: 'capacity',
      label: '容量規劃',
      icon: <BarChartOutlined />,
      children: (
        <div>
          {/* 工具列 */}
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
            actions={[{
              key: 'model',
              label: '預測模型',
              icon: <RobotOutlined />,
              children: (
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Select.Option value="linear">線性回歸</Select.Option>
                  <Select.Option value="polynomial">多項式回歸</Select.Option>
                  <Select.Option value="neural">神經網絡</Select.Option>
                </Select>
              )
            }]}
            middleContent={
              <Space>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>時間範圍:</span>
                <Select
                  value={selectedTimeRange}
                  onChange={setSelectedTimeRange}
                  style={{ width: 100 }}
                  size="small"
                >
                  <Select.Option value="7d">7 天</Select.Option>
                  <Select.Option value="30d">30 天</Select.Option>
                  <Select.Option value="90d">90 天</Select.Option>
                  <Select.Option value="180d">180 天</Select.Option>
                </Select>
              </Space>
            }
          />

          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <Table
              columns={[
                { title: '資源類型', dataIndex: 'resource', key: 'resource' },
                {
                  title: '當前使用率',
                  dataIndex: 'current',
                  key: 'current',
                  render: (value) => (
                    <Progress
                      percent={value}
                      size="small"
                      status={value > 80 ? 'exception' : value > 60 ? 'active' : 'normal'}
                    />
                  )
                },
                {
                  title: '預測使用率',
                  dataIndex: 'forecast',
                  key: 'forecast',
                  render: (value) => (
                    <Progress
                      percent={value}
                      size="small"
                      status={value > 80 ? 'exception' : value > 60 ? 'active' : 'normal'}
                      strokeColor={value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a'}
                    />
                  )
                },
                { title: '建議容量', dataIndex: 'recommended', key: 'recommended', render: (value) => `${value}%` },
              ]}
              dataSource={capacityData}
              pagination={false}
              size="small"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>

          <div>
            <Alert
              message="Web 集群建議擴容"
              description="預計未來 30 天內 Web 集群資源使用率將達到 78%，建議提前擴容以應對流量高峰。"
              type="info"
              showIcon
              action={
                <Button size="small" type="primary">
                  查看詳情
                </Button>
              }
              style={{ marginBottom: 'var(--spacing-md)' }}
            />
            <Alert
              message="資料庫集群監控"
              description="資料庫集群使用率已達 72%，建議密切監控並準備擴容方案。"
              type="warning"
              showIcon
              style={{ marginBottom: 'var(--spacing-md)' }}
            />
            <Alert
              message="快取服務優化"
              description="快取服務使用率較低，可以考慮資源優化以降低成本。"
              type="success"
              showIcon
            />
          </div>
        </div>
      ),
    },
    {
      key: 'trends',
      label: '趨勢分析',
      icon: <LineChartOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
            onAIAnalysis={handleAIAnalysis}
            middleContent={
              <Space>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>時間範圍:</span>
                <DatePicker.RangePicker
                  size="small"
                  style={{ width: 220 }}
                />
              </Space>
            }
          />

          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <Table
              columns={resourceLoadColumns}
              dataSource={resourceLoadData}
              size="small"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
              }}
              scroll={{ x: 800 }}
            />
          </div>

          <div>
            <Alert
              message="CPU 使用率異常"
              description="web-server-01 在過去 2 小時內 CPU 使用率平均達 68.5%，超過閾值 60%。"
              type="warning"
              showIcon
              action={
                <Button size="small" type="primary">
                  查看詳情
                </Button>
              }
              style={{ marginBottom: 'var(--spacing-md)' }}
            />
            <Alert
              message="記憶體使用率警告"
              description="web-server-01 記憶體使用率達 72.3%，建議監控是否持續上升。"
              type="info"
              showIcon
              style={{ marginBottom: 'var(--spacing-md)' }}
            />
            <Alert
              message="資料庫延遲異常"
              description="db-server-01 檢測到偶爾的延遲峰值，建議檢查慢查詢日誌。"
              type="warning"
              showIcon
            />
          </div>
        </div>
      ),
    },
    {
      key: 'predictions',
      label: '風險預測',
      icon: <AreaChartOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
            onAIAnalysis={handleAIAnalysis}
            actions={[{
              key: 'ai',
              label: 'AI 分析',
              icon: <RobotOutlined />,
              onClick: handleAIAnalysis
            }]}
          />

          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            {aiInsightData.map((item, index) => (
              <Card
                key={index}
                style={{
                  marginBottom: 'var(--spacing-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                }}
                size="small"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: 0, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {item.title}
                    </Title>
                    <Text style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {item.content}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 'var(--spacing-md)' }}>
                    <div style={{
                      fontSize: '12px',
                      color: item.impact === 'high' ? 'var(--brand-danger)' :
                        item.impact === 'medium' ? 'var(--brand-warning)' :
                          'var(--text-secondary)',
                      fontWeight: 'bold'
                    }}>
                      {item.confidence}% 置信度
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-tertiary)',
                      marginTop: '2px'
                    }}>
                      影響: {item.impact === 'high' ? '高' : item.impact === 'medium' ? '中' : '低'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-danger)' }}>3</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>高風險</div>
                </div>
              </Card>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-warning)' }}>8</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>中風險</div>
                </div>
              </Card>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-success)' }}>45</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>低風險</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ),
    }
  ]

  return (
    <PageLayout
      header={
        <PageHeader
          title="分析中心"
          subtitle="提供容量規劃、趨勢分析和風險預測的智能分析功能"
        />
      }
      kpiCards={
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {kpiData.map((item, index) => (
            <ContextualKPICard
              key={index}
              title={item.title}
              value={item.value}
              description={item.description}
              trend={item.trend}
              status={item.status}
            />
          ))}
        </div>
      }
      tabs={
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />
      }
    />
  )
}

export default AnalyzingPage
