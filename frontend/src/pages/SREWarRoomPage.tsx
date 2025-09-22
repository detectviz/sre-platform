import React from 'react'
import { Card } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import {
  AlertOutlined,
} from '@ant-design/icons'

const SREWarRoomPage: React.FC = () => {

  const kpiData = [
    {
      title: '待處理事件',
      value: '5',
      description: '其中 2 嚴重',
      trend: 'stable',
      status: 'warning' as const,
    },
    {
      title: '處理中',
      value: '3',
      description: '↓15% 較昨日',
      trend: '-15%',
      status: 'info' as const,
    },
    {
      title: '今日已解決',
      value: '12',
      description: '↑8% 較昨日',
      trend: '+8%',
      status: 'success' as const,
    },
    {
      title: 'AI 每日簡報',
      value: '1',
      description: '系統效能與風險預測',
      status: 'info' as const,
    },
  ]

  // 服務健康度數據
  const serviceHealthData = [
    {
      key: '1',
      name: '檔案儲存',
      healthy: 85,
      warning: 10,
      critical: 5,
      status: 'healthy',
    },
    {
      key: '2',
      name: '資料分析',
      healthy: 70,
      warning: 20,
      critical: 10,
      status: 'warning',
    },
    {
      key: '3',
      name: '通知服務',
      healthy: 90,
      warning: 8,
      critical: 2,
      status: 'healthy',
    },
    {
      key: '4',
      name: '支付管道',
      healthy: 60,
      warning: 30,
      critical: 10,
      status: 'warning',
    },
    {
      key: '5',
      name: '訂單系統',
      healthy: 75,
      warning: 15,
      critical: 10,
      status: 'warning',
    },
    {
      key: '6',
      name: '人員認證',
      healthy: 95,
      warning: 3,
      critical: 2,
      status: 'healthy',
    },
  ]

  // 資源群組狀態數據
  const resourceGroupData = [
    { name: '生產Web集群', healthy: 120, warning: 30, critical: 10 },
    { name: '生產資料庫', healthy: 80, warning: 20, critical: 5 },
    { name: '測試環境', healthy: 60, warning: 15, critical: 3 },
    { name: '開發環境', healthy: 90, warning: 8, critical: 2 },
    { name: '災備系統', healthy: 70, warning: 25, critical: 5 },
    { name: '監控平台', healthy: 85, warning: 10, critical: 5 },
    { name: 'API網關', healthy: 95, warning: 5, critical: 0 },
    { name: '快取服務', healthy: 88, warning: 10, critical: 2 },
  ]

  return (
    <div>
      <PageHeader
        title="SRE 戰情室"
        subtitle="即時監控系統狀態與業務指標"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
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

      {/* 第一排：AI 每日簡報 */}
      <Card
        size="small"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--spacing-xl)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOutlined style={{ color: 'var(--brand-warning)', fontSize: '16px' }} />
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>
              AI 每日簡報
            </h3>
          </div>
          <div style={{
            background: 'var(--bg-container)',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            最新
          </div>
        </div>
        <p style={{
          margin: 0,
          color: 'var(--text-primary)',
          lineHeight: '1.6',
          padding: 'var(--spacing-md)'
        }}>
          <span style={{ color: 'var(--brand-warning)', fontWeight: 'bold' }}>整體系統穩定</span>，但觀察到{' '}
          <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>Production Web Servers</span> 的 CPU 使用率在高峰時段有{' '}
          <span style={{ color: 'var(--brand-danger)', fontWeight: 'bold' }}>15% 的增長</span>。接近警戒線{' '}
          <span style={{ color: 'var(--brand-warning)', fontWeight: 'bold' }}>⚠️ 建議擴容</span>。延遲平穩，無明顯異常。建議關注{' '}
          <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>web-prod-03</span> 主機的日誌，該主機出現了數次警報緩慢的情況。
        </p>
      </Card>

      {/* 第二排：服務健康度和資源群組狀態 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
        {/* 左側：服務健康度總覽 */}
        <Card
          size="small"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>
              服務健康度總覽
            </h3>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>● 健康</span>
              <span style={{ color: 'var(--text-secondary)' }}>● 警告</span>
              <span style={{ color: 'var(--text-secondary)' }}>● 嚴重</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {serviceHealthData.map((service) => (
              <div key={service.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ minWidth: '80px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {service.name}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    flex: service.healthy,
                    height: '16px',
                    background: 'var(--brand-success)',
                    borderRadius: '2px',
                  }} />
                  <div style={{
                    flex: service.warning,
                    height: '16px',
                    background: 'var(--brand-warning)',
                    borderRadius: '2px',
                  }} />
                  <div style={{
                    flex: service.critical,
                    height: '16px',
                    background: 'var(--brand-danger)',
                    borderRadius: '2px',
                  }} />
                </div>
                <div style={{ minWidth: '60px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {service.healthy + service.warning + service.critical}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 右側：資源群組狀態總覽 */}
        <Card
          size="small"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>
              資源群組狀態總覽
            </h3>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>● 健康</span>
              <span style={{ color: 'var(--text-secondary)' }}>● 警告</span>
              <span style={{ color: 'var(--text-secondary)' }}>● 嚴重</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {resourceGroupData.map((group, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{ minWidth: '100px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {group.name}
                </div>
                <div style={{ flex: 1, display: 'flex', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    flex: group.healthy,
                    background: 'var(--brand-success)',
                    height: '100%',
                  }} />
                  <div style={{
                    flex: group.warning,
                    background: 'var(--brand-warning)',
                    height: '100%',
                  }} />
                  <div style={{
                    flex: group.critical,
                    background: 'var(--brand-danger)',
                    height: '100%',
                  }} />
                </div>
                <div style={{ minWidth: '60px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {group.healthy + group.warning + group.critical}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SREWarRoomPage
