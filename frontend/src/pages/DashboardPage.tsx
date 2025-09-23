import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Tooltip, Space, Input, Dropdown, MenuProps } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  SettingOutlined,
  StarOutlined,
  ExportOutlined,
  MoreOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Search } = Input
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import { getCategoryColor } from '../utils/category'
import { UNIFIED_TABLE_STYLE, UNIFIED_TABLE_PAGINATION } from '../components/index'

interface DashboardData {
  key: string
  name: string
  category: string
  owner: string
  updateTime: string
  color: string
  dashboard_type: '內建' | 'Grafana'
  grafana_url?: string
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  // 儀表板數據 - 根據 specs.md 規格總共25個儀表板
  const dashboardData: DashboardData[] = [
    // 基礎設施洞察 (2個)
    {
      key: '1',
      name: '基礎設施洞察',
      category: '基礎設施洞察',
      owner: 'SRE 平台團隊',
      updateTime: '2025/09/18 16:30',
      color: getCategoryColor('基礎設施洞察'),
      dashboard_type: '內建',
    },
    {
      key: '6',
      name: '網路效能監控',
      category: '基礎設施洞察',
      owner: '網路團隊',
      updateTime: '2025/09/18 14:22',
      color: getCategoryColor('基礎設施洞察'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },

    // 業務與 SLA 指標 (2個)
    {
      key: '2',
      name: 'SRE 戰情室',
      category: '業務與 SLA 指標',
      owner: '事件指揮中心',
      updateTime: '2025/09/18 17:15',
      color: getCategoryColor('業務與 SLA 指標'),
      dashboard_type: '內建',
    },
    {
      key: '8',
      name: 'API 服務狀態',
      category: '業務與 SLA 指標',
      owner: 'API 團隊',
      updateTime: '2025/09/18 16:10',
      color: getCategoryColor('業務與 SLA 指標'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },

    // 營運與容量 (2個)
    {
      key: '3',
      name: '容量規劃儀表板',
      category: '營運與容量',
      owner: '平台架構組',
      updateTime: '2025/09/17 00:05',
      color: getCategoryColor('營運與容量'),
      dashboard_type: '內建',
    },
    {
      key: '10',
      name: '用戶體驗監控',
      category: '營運與容量',
      owner: '前端團隊',
      updateTime: '2025/09/18 17:30',
      color: getCategoryColor('營運與容量'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },

    // 自動化與效率 (1個)
    {
      key: '4',
      name: '自動化效能總覽',
      category: '自動化與效率',
      owner: '自動化中心',
      updateTime: '2025/09/17 19:40',
      color: getCategoryColor('自動化與效率'),
      dashboard_type: '內建',
    },

    // 團隊自訂 (1個)
    {
      key: '5',
      name: '團隊自訂儀表板',
      category: '團隊自訂',
      owner: 'DevOps 小組',
      updateTime: '2025/09/12 21:20',
      color: getCategoryColor('團隊自訂'),
      dashboard_type: '內建',
    },

    // 其他內建儀表板 (7個，總共15個內建儀表板)
    {
      key: '7',
      name: '資料庫效能儀表板',
      category: '基礎設施洞察',
      owner: 'DBA 團隊',
      updateTime: '2025/09/18 15:45',
      color: getCategoryColor('基礎設施洞察'),
      dashboard_type: '內建',
    },
    {
      key: '11',
      name: 'Kubernetes 集群監控',
      category: '營運與容量',
      owner: '平台團隊',
      updateTime: '2025/09/18 13:15',
      color: getCategoryColor('營運與容量'),
      dashboard_type: '內建',
    },
    {
      key: '12',
      name: 'CI/CD 流程監控',
      category: '自動化與效率',
      owner: 'DevOps 團隊',
      updateTime: '2025/09/18 18:00',
      color: getCategoryColor('自動化與效率'),
      dashboard_type: '內建',
    },
    {
      key: '13',
      name: '成本優化儀表板',
      category: '營運與容量',
      owner: '財務團隊',
      updateTime: '2025/09/18 11:30',
      color: getCategoryColor('營運與容量'),
      dashboard_type: '內建',
    },
    {
      key: '14',
      name: '安全性監控儀表板',
      category: '團隊自訂',
      owner: '安全團隊',
      updateTime: '2025/09/18 12:45',
      color: getCategoryColor('團隊自訂'),
      dashboard_type: '內建',
    },
    {
      key: '15',
      name: '測試環境監控',
      category: '團隊自訂',
      owner: 'QA 團隊',
      updateTime: '2025/09/18 10:15',
      color: getCategoryColor('團隊自訂'),
      dashboard_type: '內建',
    },
    {
      key: '16',
      name: '備份狀態監控',
      category: '營運與容量',
      owner: '運維團隊',
      updateTime: '2025/09/18 09:30',
      color: getCategoryColor('營運與容量'),
      dashboard_type: '內建',
    },

    // 其他 Grafana 儀表板 (5個，總共10個 Grafana 儀表板)
    {
      key: '17',
      name: '系統日誌分析',
      category: '基礎設施洞察',
      owner: 'SRE 平台團隊',
      updateTime: '2025/09/18 16:00',
      color: getCategoryColor('基礎設施洞察'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '18',
      name: '應用效能追蹤',
      category: '業務與 SLA 指標',
      owner: '應用團隊',
      updateTime: '2025/09/18 17:00',
      color: getCategoryColor('業務與 SLA 指標'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '19',
      name: '容器資源監控',
      category: '營運與容量',
      owner: '容器團隊',
      updateTime: '2025/09/18 18:30',
      color: getCategoryColor('營運與容量'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '20',
      name: '安全事件分析',
      category: '團隊自訂',
      owner: '安全團隊',
      updateTime: '2025/09/18 19:00',
      color: getCategoryColor('團隊自訂'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '21',
      name: '業務指標總覽',
      category: '業務與 SLA 指標',
      owner: '業務團隊',
      updateTime: '2025/09/18 19:30',
      color: getCategoryColor('業務與 SLA 指標'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '22',
      name: '資料庫連接池',
      category: '基礎設施洞察',
      owner: 'DBA 團隊',
      updateTime: '2025/09/18 20:00',
      color: getCategoryColor('基礎設施洞察'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '23',
      name: 'API 錯誤追蹤',
      category: '業務與 SLA 指標',
      owner: '後端團隊',
      updateTime: '2025/09/18 20:30',
      color: getCategoryColor('業務與 SLA 指標'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '24',
      name: '負載均衡器狀態',
      category: '營運與容量',
      owner: '運維團隊',
      updateTime: '2025/09/18 21:00',
      color: getCategoryColor('營運與容量'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
    {
      key: '25',
      name: 'DevOps 效能',
      category: '自動化與效率',
      owner: 'DevOps 團隊',
      updateTime: '2025/09/18 21:30',
      color: getCategoryColor('自動化與效率'),
      dashboard_type: 'Grafana',
      grafana_url: 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5',
    },
  ]

  // 創建分類數據
  const categories = [
    { key: '全部', label: '全部', count: dashboardData.length, color: getCategoryColor('全部') },
    { key: '基礎設施洞察', label: '基礎設施洞察', count: dashboardData.filter(item => item.category === '基礎設施洞察').length, color: getCategoryColor('基礎設施洞察') },
    { key: '業務與 SLA 指標', label: '業務與 SLA 指標', count: dashboardData.filter(item => item.category === '業務與 SLA 指標').length, color: getCategoryColor('業務與 SLA 指標') },
    { key: '營運與容量', label: '營運與容量', count: dashboardData.filter(item => item.category === '營運與容量').length, color: getCategoryColor('營運與容量') },
    { key: '自動化與效率', label: '自動化與效率', count: dashboardData.filter(item => item.category === '自動化與效率').length, color: getCategoryColor('自動化與效率') },
    { key: '團隊自訂', label: '團隊自訂', count: dashboardData.filter(item => item.category === '團隊自訂').length, color: getCategoryColor('團隊自訂') },
  ]

  const [selectedCategory, setSelectedCategory] = React.useState('全部')
  const [searchText, setSearchText] = React.useState('')

  // 過濾數據
  const filteredData = React.useMemo(() => {
    return dashboardData.filter(item => {
      const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory
      const matchesSearch = searchText === '' ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchText.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [dashboardData, selectedCategory, searchText])

  const handleSearch = (value: string) => {
    console.log('搜尋儀表板:', value, '當前搜尋狀態:', searchText)
    setSearchText(value)
  }

  // 操作選單項目生成
  const getActionMenuItems = (record: DashboardData): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'set-homepage',
        icon: <StarOutlined />,
        label: '設定為首頁',
      },
      {
        key: 'share',
        icon: <ExportOutlined />,
        label: '分享',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '刪除',
        danger: true,
      },
    ]

    // 根據儀表板類型添加特定操作
    if (record.dashboard_type === '內建') {
      items.splice(1, 0, {
        key: 'edit-layout',
        icon: <EditOutlined />,
        label: '編輯版面',
      })
      items.splice(2, 0, {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '設定',
      })
    } else if (record.dashboard_type === 'Grafana') {
      items.splice(1, 0, {
        key: 'edit-in-grafana',
        icon: <ShareAltOutlined />,
        label: '在 Grafana 中編輯',
      })
      items.splice(2, 0, {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '設定',
      })
    }

    return items
  }

  // 處理操作選單點擊
  const handleActionMenuClick = (key: string, record: DashboardData) => {
    switch (key) {
      case 'set-homepage':
        console.log('設定為首頁:', record.name)
        break
      case 'edit-layout':
        console.log('編輯版面:', record.name)
        break
      case 'edit-in-grafana':
        if (record.grafana_url) {
          window.open(record.grafana_url, '_blank')
        }
        break
      case 'settings':
        console.log('開啟設定:', record.name)
        break
      case 'share':
        console.log('分享儀表板:', record.name)
        break
      case 'delete':
        console.log('刪除儀表板:', record.name)
        break
      default:
        break
    }
  }

  const columns: ColumnsType<DashboardData> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string, record: DashboardData) => (
        <Space>
          {/* 類型圖示 */}
          {record.dashboard_type === '內建' ? (
            <Tooltip title="內建儀表板">
              <DashboardOutlined style={{ color: 'var(--brand-primary)', fontSize: '14px' }} />
            </Tooltip>
          ) : (
            <Tooltip title="Grafana 儀表板">
              <div style={{
                width: '14px',
                height: '14px',
                background: 'linear-gradient(45deg, #F46821, #F7931E, #FBBF24)',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                G
              </div>
            </Tooltip>
          )}

          {/* 分類顏色指示器 */}
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
              // 根據儀表板類型跳轉到不同頁面
              if (record.dashboard_type === '內建') {
                // 內建儀表板直接跳轉到 React 頁面
                const routeMap: Record<string, string> = {
                  '基礎設施洞察': '/infrastructure',
                  'SRE 戰情室': '/warroom',
                  '容量規劃儀表板': '/analyzing',
                }
                const route = routeMap[record.name]
                if (route) {
                  console.log(`導航到內建儀表板: ${record.name} -> ${route}`)
                  navigate(route)
                } else {
                  console.log(`內建儀表板 ${record.name} 的路由未配置`)
                }
              } else {
                // Grafana 儀表板跳轉到 DashboardViewPage
                const dashboardPath = `/dashboard/${encodeURIComponent(record.name)}`
                console.log(`導航到 Grafana 儀表板: ${record.name} -> ${dashboardPath}`)
                navigate(dashboardPath)
              }
            }}
          >
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: '類型',
      dataIndex: 'dashboard_type',
      key: 'dashboard_type',
      render: (dashboard_type: '內建' | 'Grafana') => (
        <Tag color={dashboard_type === '內建' ? 'cyan' : 'geekblue'}>
          {dashboard_type}
        </Tag>
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
      render: (_, record: DashboardData) => (
        <Space size="small">
          <Tooltip title="查看詳情">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>

          <Dropdown
            menu={{
              items: getActionMenuItems(record),
              onClick: ({ key }) => handleActionMenuClick(key, record),
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  const kpiData = [
    {
      title: '總儀表板數',
      value: '25',
      description: '包含內建儀表板和 Grafana 儀表板',
      trend: '+4',
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
      description: '高優先級監控室，內建儀表板',
      trend: 'stable',
      status: 'warning' as const,
    },
    {
      title: '基礎設施洞察',
      value: '10',
      description: '專注於基礎設施監控的儀表板',
      trend: '+2',
      status: 'info' as const,
    },
  ]


  return (
    <div>
      <PageHeader
        title="儀表板管理"
        subtitle="統一管理業務儀表板、SRE 戰情室和基礎設施洞察面板"
        extra={
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
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)',
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

      {/* 分類按鈕和工具列 */}
      <ToolbarActions
        middleContent={
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginLeft: 'var(--spacing-lg)',
          }}>
            {categories.map((category) => (
              <Button
                key={category.key}
                type={selectedCategory === category.key ? "primary" : "default"}
                size="small"
                onClick={() => setSelectedCategory(category.key)}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '12px',
                  padding: '4px 12px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: category.color,
                  opacity: selectedCategory === category.key ? 1 : 0.6,
                }} />
                <span>{category.label}</span>
                <span style={{
                  background: selectedCategory === category.key ? 'rgba(255, 255, 255, 0.2)' : `${category.color}20`,
                  color: selectedCategory === category.key ? 'white' : category.color,
                  padding: '1px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  minWidth: '16px',
                  textAlign: 'center',
                  lineHeight: '12px',
                }}>
                  {category.count}
                </span>
              </Button>
            ))}
          </div>
        }
        middleContentPosition="left"
        showRefresh={false}
        showSearch={false}
        showAdd={false}
        showExport={false}
        actions={[
          {
            key: 'column-settings',
            label: '欄位設定',
            icon: <SettingOutlined />,
            onClick: () => console.log('開啟欄位設定'),
            tooltip: '表格欄位顯示設定',
          }
        ]}
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        size="middle"
        style={UNIFIED_TABLE_STYLE}
        pagination={UNIFIED_TABLE_PAGINATION}
      />
    </div>
  )
}

export default DashboardPage
