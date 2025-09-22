import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Tooltip, Space, Input } from 'antd'

const { Search } = Input
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface DashboardData {
  key: string
  name: string
  category: string
  owner: string
  updateTime: string
  color: string
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [searchText, setSearchText] = useState<string>('')
  const handleSearch = (value: string) => {
    console.log('搜尋儀表板:', value)
    setSearchText(value)
  }

  // 儀表板數據
  const dashboardData = [
    {
      key: '1',
      name: '基礎設施洞察',
      category: '基礎設施洞察',
      owner: 'SRE 平台團隊',
      updateTime: '2025/09/18 16:30',
      color: '#1890ff',
    },
    {
      key: '2',
      name: 'SRE 戰情室',
      category: '業務與 SLA 指標',
      owner: '事件指揮中心',
      updateTime: '2025/09/18 17:15',
      color: '#52c41a',
    },
    {
      key: '3',
      name: '容量規劃儀表板',
      category: '營運與容量',
      owner: '平台架構組',
      updateTime: '2025/09/17 00:05',
      color: '#faad14',
    },
    {
      key: '4',
      name: '自動化效能總覽',
      category: '自動化與效率',
      owner: '自動化中心',
      updateTime: '2025/09/17 19:40',
      color: '#722ed1',
    },
    {
      key: '5',
      name: '團隊自訂儀表板',
      category: '團隊自訂',
      owner: 'DevOps 小組',
      updateTime: '2025/09/12 21:20',
      color: '#13c2c2',
    },
  ]

  // 分類按鈕配置
  const categories = [
    { key: '全部', label: '全部', count: dashboardData.length },
    { key: '基礎設施洞察', label: '基礎設施洞察', count: dashboardData.filter(item => item.category === '基礎設施洞察').length },
    { key: '業務與 SLA 指標', label: '業務與 SLA 指標', count: dashboardData.filter(item => item.category === '業務與 SLA 指標').length },
    { key: '營運與容量', label: '營運與容量', count: dashboardData.filter(item => item.category === '營運與容量').length },
    { key: '自動化與效率', label: '自動化與效率', count: dashboardData.filter(item => item.category === '自動化與效率').length },
    { key: '團隊自訂', label: '團隊自訂', count: dashboardData.filter(item => item.category === '團隊自訂').length },
  ]

  // 過濾數據
  const filteredData = dashboardData.filter(item => {
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory
    const matchesSearch = searchText === '' || item.name.toLowerCase().includes(searchText.toLowerCase()) || item.owner.toLowerCase().includes(searchText.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const columns: ColumnsType<DashboardData> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string, record: DashboardData) => (
        <Space>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: record.color,
          }} />
          <Button
            type="link"
            style={{
              color: 'var(--text-primary)',
              padding: 0,
              height: 'auto',
              fontSize: '14px'
            }}
            onClick={() => {
              if (record.name === '基礎設施洞察') {
                navigate('/infrastructure')
              } else if (record.name === 'SRE 戰情室') {
                navigate('/warroom')
              }
            }}
          >
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: '類別',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={category === '基礎設施洞察' ? 'blue' :
          category === '業務與 SLA 指標' ? 'green' :
            category === '營運與容量' ? 'orange' :
              category === '自動化與效率' ? 'purple' :
                category === '團隊自訂' ? 'cyan' : 'default'}>
          {category}
        </Tag>
      ),
    },
    {
      title: '擁有者',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: '更新時間',
      dataIndex: 'updateTime',
      key: 'updateTime',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="編輯">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="複製">
            <Button type="text" size="small" icon={<CopyOutlined />} />
          </Tooltip>
          <Tooltip title="分享">
            <Button type="text" size="small" icon={<ShareAltOutlined />} />
          </Tooltip>
          <Tooltip title="刪除">
            <Button type="text" size="small" icon={<DeleteOutlined />} danger />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const kpiData = [
    {
      title: '總儀表板數',
      value: '23',
      description: '包含業務和技術儀表板',
      trend: '+2',
      status: 'info' as const,
    },
    {
      title: '活躍用戶',
      value: '156',
      description: '本月訪問儀表板的用戶',
      trend: '+12.5%',
      status: 'success' as const,
    },
    {
      title: 'SRE 戰情室',
      value: '4',
      description: '高優先級監控室',
      trend: 'stable',
      status: 'warning' as const,
    },
    {
      title: '基礎設施洞察',
      value: '8',
      description: '專注於基礎設施監控的儀表板',
      trend: '+1',
      status: 'info' as const,
    },
  ]


  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--spacing-2xl)',
          paddingBottom: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              margin: 0,
              color: 'var(--text-primary)',
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '24px',
              fontWeight: 600,
            }}
          >
            儀表板管理
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--spacing-xs)',
          }}>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              統一管理業務儀表板、SRE 戰情室和基礎設施洞察面板
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Search
                placeholder="搜尋儀表板名稱..."
                onSearch={handleSearch}
                style={{ width: 320 }}
                allowClear
              />

              <Tooltip title="創建新的儀表板">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => console.log('新增儀表板')}
                >
                  新增儀表板
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

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

      <ToolbarActions
        showRefresh={false}
        showSearch={false}
        actions={[]}
        middleContent={
          <Button.Group style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {categories.map((category, index) => {
              const getCategoryColor = (categoryKey: string) => {
                switch (categoryKey) {
                  case '全部': return '#1890ff'
                  case '基礎設施洞察': return '#1890ff'
                  case '業務與 SLA 指標': return '#52c41a'
                  case '營運與容量': return '#fa8c16'
                  case '自動化與效率': return '#9254de'
                  case '團隊自訂': return '#13c2c2'
                  default: return '#1890ff'
                }
              }

              const isSelected = selectedCategory === category.key
              const color = getCategoryColor(category.key)

              return (
                <Button
                  key={category.key}
                  type="default"
                  onClick={() => setSelectedCategory(category.key)}
                  style={{
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    fontWeight: 500,
                    border: 'none',
                    borderRadius: '0',
                    background: isSelected ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.85)',
                    borderRight: index < categories.length - 1 ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                    position: 'relative'
                  }}
                >
                  {category.key !== '全部' && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: color,
                      opacity: 0.8
                    }} />
                  )}
                  <span style={{ fontSize: '13px' }}>
                    {category.label}
                  </span>
                  <div style={{
                    background: `${color}20`,
                    color: color,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: '14px'
                  }}>
                    {category.count}
                  </div>
                </Button>
              )
            })}
          </Button.Group>
        }
        middleContentPosition="left"
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        size="small"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
        }}
      />
    </div>
  )
}

export default DashboardPage
