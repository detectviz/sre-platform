import React, { useState, useEffect } from 'react'
import { Modal, Input, List, Tag, Space, Typography } from 'antd'
import {
  SearchOutlined,
  HistoryOutlined,
  HddOutlined,
  CodeOutlined,
  DashboardOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'resource' | 'incident' | 'script' | 'dashboard' | 'page'
  path: string
  icon: React.ReactNode
}

interface GlobalSearchProps {
  visible: boolean
  onClose: () => void
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ visible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // 模擬搜索數據
  const mockData: SearchResult[] = [
    // 資源類型
    {
      id: 'resource-1',
      title: 'Web Server Cluster',
      description: '生產環境 Web 服務器集群',
      type: 'resource',
      path: '/resources',
      icon: <HddOutlined />
    },
    {
      id: 'resource-2',
      title: 'Database Primary',
      description: 'MySQL 主數據庫實例',
      type: 'resource',
      path: '/resources',
      icon: <HddOutlined />
    },

    // 事件類型
    {
      id: 'incident-1',
      title: 'CPU 使用率過高警報',
      description: '服務器 CPU 使用率超過 85%',
      type: 'incident',
      path: '/incidents',
      icon: <HistoryOutlined />
    },
    {
      id: 'incident-2',
      title: '磁盤空間不足',
      description: '存儲服務器磁盤使用率達到 90%',
      type: 'incident',
      path: '/incidents',
      icon: <HistoryOutlined />
    },

    // 自動化腳本類型
    {
      id: 'script-1',
      title: '重啟服務腳本',
      description: '自動重啟失效服務的腳本',
      type: 'script',
      path: '/automation',
      icon: <CodeOutlined />
    },
    {
      id: 'script-2',
      title: '備份數據庫',
      description: '每日自動備份數據庫腳本',
      type: 'script',
      path: '/automation',
      icon: <CodeOutlined />
    },

    // 儀表板類型
    {
      id: 'dashboard-1',
      title: 'SRE 戰情室',
      description: '即時監控和事件響應中心',
      type: 'dashboard',
      path: '/',
      icon: <DashboardOutlined />
    },
    {
      id: 'dashboard-2',
      title: '基礎設施洞察',
      description: '基礎設施監控和分析',
      type: 'dashboard',
      path: '/infrastructure',
      icon: <DashboardOutlined />
    },

    // 頁面類型
    {
      id: 'page-1',
      title: '分析中心',
      description: '容量、趨勢和預測分析',
      type: 'page',
      path: '/analyzing',
      icon: <FileTextOutlined />
    }
  ]

  const getTypeLabel = (type: SearchResult['type']) => {
    const typeConfig = {
      resource: { label: '資源', color: 'blue' },
      incident: { label: '事件', color: 'red' },
      script: { label: '腳本', color: 'green' },
      dashboard: { label: '儀表板', color: 'purple' },
      page: { label: '頁面', color: 'orange' }
    }
    return typeConfig[type]
  }

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)

    // 模擬 API 延遲
    setTimeout(() => {
      const filtered = mockData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setLoading(false)
    }, 300)
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path)
    onClose()
    setSearchQuery('')
    setSearchResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const groupedResults = searchResults.reduce((groups, result) => {
    const type = result.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(result)
    return groups
  }, {} as Record<string, SearchResult[]>)

  useEffect(() => {
    if (visible) {
      // 自動聚焦搜索框
      setTimeout(() => {
        const searchInput = document.querySelector('.global-search-input input') as HTMLInputElement
        searchInput?.focus()
      }, 100)
    } else {
      // 清理搜索狀態
      setSearchQuery('')
      setSearchResults([])
    }
  }, [visible])

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery])

  return (
    <Modal
      title="全局搜索"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 50 }}
      destroyOnClose
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input
          className="global-search-input"
          size="large"
          placeholder="搜尋資源、事件、腳本..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        {searchQuery && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">搜索中...</Text>
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">未找到匹配結果</Text>
              </div>
            ) : (
              Object.entries(groupedResults).map(([type, results]) => (
                <div key={type} style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    {getTypeLabel(type as SearchResult['type']).label}
                  </Text>
                  <List
                    size="small"
                    dataSource={results}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => handleResultClick(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <List.Item.Meta
                          avatar={item.icon}
                          title={
                            <Space>
                              <Text>{item.title}</Text>
                              <Tag
                                color={getTypeLabel(item.type).color}
                                size="small"
                              >
                                {getTypeLabel(item.type).label}
                              </Tag>
                            </Space>
                          }
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </Space>
    </Modal>
  )
}

export default GlobalSearch