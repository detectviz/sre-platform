import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const AnalyzingPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('capacity')

  useEffect(() => {
    const path = location.pathname
    if (path === '/analyzing' || path === '/analyzing/capacity') {
      setActiveTab('capacity')
    } else if (path === '/analyzing/trends') {
      setActiveTab('trends')
    } else if (path === '/analyzing/predictions') {
      setActiveTab('predictions')
    } else {
      setActiveTab('capacity')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    switch (key) {
      case 'capacity':
        navigate('/analyzing/capacity')
        break
      case 'trends':
        navigate('/analyzing/trends')
        break
      case 'predictions':
        navigate('/analyzing/predictions')
        break
      default:
        navigate('/analyzing/capacity')
    }
  }

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
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <BarChartOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              容量規劃
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            分析系統容量趨勢，預測資源需求
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['容量趨勢分析', '資源需求預測', '效能瓶頸識別', '擴容建議', '成本優化']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'trends',
      label: '趨勢分析',
      icon: <LineChartOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <LineChartOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              趨勢分析
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            分析系統效能和業務指標的長期趨勢
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['效能趨勢追蹤', '業務指標監控', '異常模式識別', '季節性分析', '比較分析']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'predictions',
      label: '風險預測',
      icon: <AreaChartOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <AreaChartOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              風險預測
            </Title>
          </Space>
          <Text
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            基於機器學習預測潛在風險和異常
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['風險評估模型', '異常預測算法', '警示閾值設定', '預測準確度驗證', '風險緩解建議']}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: 'var(--spacing-sm) 0',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <Space>
                  <div style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-tertiary)',
                  }} />
                  {item}
                </Space>
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="分析中心"
        subtitle="提供容量規劃、趨勢分析和風險預測的智能分析功能"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
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

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </div>
  )
}

export default AnalyzingPage
