import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography, List, Space, Divider, Tabs } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  CodeOutlined,
  ScheduleOutlined,
  HistoryOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const AutomationPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('scripts')

  useEffect(() => {
    const path = location.pathname
    if (path === '/automation' || path === '/automation/scripts') {
      setActiveTab('scripts')
    } else if (path === '/automation/schedules') {
      setActiveTab('schedules')
    } else if (path === '/automation/logs') {
      setActiveTab('logs')
    } else {
      setActiveTab('scripts')
    }
  }, [location.pathname])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    switch (key) {
      case 'scripts':
        navigate('/automation/scripts')
        break
      case 'schedules':
        navigate('/automation/schedules')
        break
      case 'logs':
        navigate('/automation/logs')
        break
      default:
        navigate('/automation/scripts')
    }
  }

  const kpiData = [
    {
      title: '腳本總數',
      value: '47',
      description: '包含自動化腳本和工具',
      trend: '+3',
      status: 'info' as const,
    },
    {
      title: '執行成功率',
      value: '94.2%',
      description: '本月自動化執行成功率',
      trend: '+2.1%',
      status: 'success' as const,
    },
    {
      title: '活躍排程',
      value: '12',
      description: '當前運行的自動化任務',
      trend: 'stable',
      status: 'info' as const,
    },
    {
      title: '執行日誌',
      value: '1,247',
      description: '今日自動化執行記錄',
      trend: '+15.3%',
      status: 'info' as const,
    },
  ]

  const tabItems = [
    {
      key: 'scripts',
      label: '腳本庫',
      icon: <CodeOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <CodeOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              腳本庫
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
            管理自動化腳本和工具
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['腳本創建', '腳本編輯', '腳本測試', '腳本版本控制', '腳本共享']}
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
      key: 'schedules',
      label: '排程管理',
      icon: <ScheduleOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <ScheduleOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              排程管理
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
            配置自動化任務的執行排程和觸發條件
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['排程創建', '觸發條件', '重複規則', '依賴管理', '排程監控']}
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
      key: 'logs',
      label: '執行日誌',
      icon: <HistoryOutlined />,
      children: (
        <div style={{ padding: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <HistoryOutlined style={{ fontSize: '18px' }} />
            <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>
              執行日誌
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
            查看自動化任務的執行歷史和結果
          </Text>
          <Divider style={{ margin: 'var(--spacing-md) 0', borderColor: 'var(--border-light)' }} />
          <List
            size="small"
            dataSource={['執行記錄', '成功/失敗統計', '執行時間分析', '錯誤日誌', '效能監控']}
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
        title="自動化中心"
        subtitle="統一管理自動化腳本、排程任務和執行日誌"
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

export default AutomationPage
