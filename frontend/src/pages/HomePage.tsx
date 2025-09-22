import React from 'react'
import { Row, Col, Card, Typography } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'

const { Text } = Typography

const HomePage: React.FC = () => {
  const kpiData = [
    {
      title: '系統健康度',
      value: '95%',
      description: '12/13 系統正常運行',
      trend: '+2.1%',
      status: 'success' as const,
    },
    {
      title: '活躍事件',
      value: '3',
      description: '待處理事件數量',
      trend: '-1',
      status: 'warning' as const,
    },
    {
      title: 'SLA 指標',
      value: '99.9%',
      description: '可用度達標率',
      trend: '+0.1%',
      status: 'success' as const,
    },
    {
      title: '資源使用率',
      value: '78%',
      description: '平均使用率',
      trend: '+5.2%',
      status: 'info' as const,
    },
  ]

  return (
    <div>
      <PageHeader
        title="SRE 戰情室"
        subtitle="即時監控系統狀態與業務指標"
      />

      <ToolbarActions />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title="系統狀態總覽"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                📊 系統狀態圖表區域
              </Text>
              <br />
              <Text
                type="secondary"
                style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
              >
                此處將顯示系統健康狀態的即時圖表
              </Text>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="活躍事件"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                🚨 活躍事件清單區域
              </Text>
              <br />
              <Text
                type="secondary"
                style={{ fontSize: '12px', marginTop: 'var(--spacing-sm)' }}
              >
                此處將顯示活躍事件的詳細清單
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 'var(--spacing-lg)' }}>
        <Col span={8}>
          <Card
            title="資源健康"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                🖥️ 資源健康狀況
              </Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="效能趨勢"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                📈 效能指標趨勢
              </Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="AI 分析"
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <Text style={{ color: 'var(--text-secondary)' }}>
                🤖 智能分析結果
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
