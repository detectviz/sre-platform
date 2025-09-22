import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Tooltip, Space, Input } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input
import { ContextualKPICard } from '../components/ContextualKPICard'
import { CategoryFilter } from '../components/CategoryFilter'
import { useCategories } from '../hooks/useCategories'
import { getCategoryColor } from '../utils/category'

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

  // 儀表板數據
  const dashboardData = [
    {
      key: '1',
      name: '基礎設施洞察',
      category: '基礎設施洞察',
      owner: 'SRE 平台團隊',
      updateTime: '2025/09/18 16:30',
      color: getCategoryColor('基礎設施洞察'),
    },
    {
      key: '2',
      name: 'SRE 戰情室',
      category: '業務與 SLA 指標',
      owner: '事件指揮中心',
      updateTime: '2025/09/18 17:15',
      color: getCategoryColor('業務與 SLA 指標'),
    },
    {
      key: '3',
      name: '容量規劃儀表板',
      category: '營運與容量',
      owner: '平台架構組',
      updateTime: '2025/09/17 00:05',
      color: getCategoryColor('營運與容量'),
    },
    {
      key: '4',
      name: '自動化效能總覽',
      category: '自動化與效率',
      owner: '自動化中心',
      updateTime: '2025/09/17 19:40',
      color: getCategoryColor('自動化與效率'),
    },
    {
      key: '5',
      name: '團隊自訂儀表板',
      category: '團隊自訂',
      owner: 'DevOps 小組',
      updateTime: '2025/09/12 21:20',
      color: getCategoryColor('團隊自訂'),
    },
    // 新增測試資料
    {
      key: '6',
      name: '網路效能監控',
      category: '基礎設施洞察',
      owner: '網路團隊',
      updateTime: '2025/09/18 14:22',
      color: getCategoryColor('基礎設施洞察'),
    },
    {
      key: '7',
      name: '資料庫效能儀表板',
      category: '基礎設施洞察',
      owner: 'DBA 團隊',
      updateTime: '2025/09/18 15:45',
      color: getCategoryColor('基礎設施洞察'),
    },
    {
      key: '8',
      name: 'API 服務狀態',
      category: '業務與 SLA 指標',
      owner: 'API 團隊',
      updateTime: '2025/09/18 16:10',
      color: getCategoryColor('業務與 SLA 指標'),
    },
    {
      key: '9',
      name: '用戶體驗監控',
      category: '業務與 SLA 指標',
      owner: '前端團隊',
      updateTime: '2025/09/18 17:30',
      color: getCategoryColor('業務與 SLA 指標'),
    },
    {
      key: '10',
      name: 'Kubernetes 集群監控',
      category: '營運與容量',
      owner: '平台團隊',
      updateTime: '2025/09/18 13:15',
      color: getCategoryColor('營運與容量'),
    },
    {
      key: '11',
      name: 'CI/CD 流程監控',
      category: '自動化與效率',
      owner: 'DevOps 團隊',
      updateTime: '2025/09/18 18:00',
      color: getCategoryColor('自動化與效率'),
    },
    {
      key: '12',
      name: '成本優化儀表板',
      category: '營運與容量',
      owner: '財務團隊',
      updateTime: '2025/09/18 11:30',
      color: getCategoryColor('營運與容量'),
    },
    {
      key: '13',
      name: '安全性監控儀表板',
      category: '團隊自訂',
      owner: '安全團隊',
      updateTime: '2025/09/18 12:45',
      color: getCategoryColor('團隊自訂'),
    },
    {
      key: '14',
      name: '測試環境監控',
      category: '團隊自訂',
      owner: 'QA 團隊',
      updateTime: '2025/09/18 10:15',
      color: getCategoryColor('團隊自訂'),
    },
    {
      key: '15',
      name: '備份狀態監控',
      category: '營運與容量',
      owner: '運維團隊',
      updateTime: '2025/09/18 09:30',
      color: getCategoryColor('營運與容量'),
    },
  ]

  // 使用分類管理 Hook
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    searchText,
    setSearchText,
    filteredData
  } = useCategories(dashboardData, 'category', ['name', 'owner'])

  const handleSearch = (value: string) => {
    console.log('搜尋儀表板:', value, '當前搜尋狀態:', searchText)
    setSearchText(value)
  }

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
              // 跳轉到動態儀表板頁面
              const dashboardPath = `/dashboard/${encodeURIComponent(record.name)}`
              console.log(`導航到儀表板: ${record.name} -> ${dashboardPath}`)
              navigate(dashboardPath)
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
        <Tag color={getCategoryColor(category)}>
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
      value: '15',
      description: '包含業務和技術儀表板',
      trend: '+3',
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

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
