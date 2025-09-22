import React from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GrafanaDashboard } from '../components/GrafanaDashboard'
import { Card, Typography } from 'antd'

const { Title, Text } = Typography

// 儀表板配置映射
const dashboardConfig: Record<string, {
  title: string
  url: string
  description: string
}> = {
  '基礎設施洞察': {
    title: '基礎設施洞察 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: '系統監控儀表板，包含 CPU、內存、磁盤使用率等指標'
  },
  'SRE 戰情室': {
    title: 'SRE 戰情室 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '即時監控和事件響應中心，包含系統健康度、服務狀態等'
  },
  '網路效能監控': {
    title: '網路效能監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: '網路流量、延遲、丟包率等網路效能指標'
  },
  '資料庫效能儀表板': {
    title: '資料庫效能 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: '資料庫查詢效能、連接數、緩存命中等指標'
  },
  'API 服務狀態': {
    title: '',
    url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    description: ''
  },
  '用戶體驗監控': {
    title: '用戶體驗監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '頁面載入時間、用戶行為分析、錯誤追蹤'
  },
  'Kubernetes 集群監控': {
    title: 'Kubernetes 集群監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: 'Pod 狀態、資源使用率、節點健康度等'
  },
  'CI/CD 流程監控': {
    title: 'CI/CD 流程監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '構建時間、部署成功率、測試覆蓋率等'
  },
  '成本優化儀表板': {
    title: '成本優化 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '雲資源成本、優化建議、使用效率等'
  },
  '安全性監控儀表板': {
    title: '安全性監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '安全事件、漏洞掃描、訪問日誌等'
  },
  '測試環境監控': {
    title: '測試環境監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: '測試環境健康度、自動化測試結果等'
  },
  '備份狀態監控': {
    title: '備份狀態監控 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000074/alerting',
    description: '備份成功率、恢復測試、存儲使用率等'
  },
  '容量規劃儀表板': {
    title: '容量規劃 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '資源趨勢分析、容量預測、擴容建議'
  },
  '自動化效能總覽': {
    title: '自動化效能 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/000000012/grafana-play-home',
    description: '自動化腳本執行狀況、成功率、效能指標'
  },
  '團隊自訂儀表板': {
    title: '團隊自訂 - Grafana 儀表板',
    url: 'https://play.grafana.org/d/cdgx261sa1ypsa',
    description: '團隊專屬監控指標和報表'
  }
}

const DashboardViewPage: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>()
  const config = dashboardConfig[dashboardId || '']

  if (!config) {
    return (
      <div>
        <PageHeader
          title="儀表板未找到"
          subtitle={`找不到儀表板: ${dashboardId}`}
        />
        <Card style={{ marginTop: 'var(--spacing-xl)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <Title level={3} style={{ color: 'var(--brand-danger)' }}>
              ⚠️ 儀表板不存在
            </Title>
            <Text type="secondary">
              請確認儀表板名稱是否正確，或聯繫系統管理員。
            </Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {(config.title || config.description) && (
        <PageHeader
          title={config.title || 'Grafana 儀表板'}
          subtitle={config.description}
          showRefresh={false}
        />
      )}

      {/* Grafana 儀表板嵌入 */}
      <GrafanaDashboard
        dashboardUrl={config.url}
        title={config.title || 'Grafana 儀表板'}
        height="800px"
        showControls={true}
        kiosk={true}
        autofitpanels={true}
        timeRange="Last 6 hours"
      />
    </div>
  )
}

export default DashboardViewPage
