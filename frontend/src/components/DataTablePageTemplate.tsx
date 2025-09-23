import React, { useState } from 'react'
import { Tag, Button, Space } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import DataTablePage, { DataTablePageConfig } from './DataTablePage'
import type { ColumnsType } from 'antd/es/table'

// 示例數據類型
interface ExampleData {
  key: string
  name: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
}

// 示例列配置
const createExampleColumns = (onEdit: (record: ExampleData) => void, onDelete: (record: ExampleData) => void): ColumnsType<ExampleData> => [
  {
    title: '名稱',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    width: 200,
  },
  {
    title: '狀態',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>
        {status === 'active' ? '活躍' : status === 'inactive' ? '停用' : '維護中'}
      </Tag>
    ),
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '創建時間',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => new Date(date).toLocaleString('zh-TW'),
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="small">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => console.log('查看', record.name)}
        >
          查看
        </Button>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        >
          編輯
        </Button>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record)}
        >
          刪除
        </Button>
      </Space>
    ),
  },
]

// 示例數據
const createExampleData = (): ExampleData[] => [
  {
    key: '1',
    name: '示例項目 1',
    status: 'active',
    description: '這是一個示例項目的描述信息',
    createdAt: '2025-09-18 10:30:00',
    updatedAt: '2025-09-18 15:45:00',
  },
  {
    key: '2',
    name: '示例項目 2',
    status: 'inactive',
    description: '這是另一個示例項目的描述信息，內容比較長需要省略顯示',
    createdAt: '2025-09-17 14:20:00',
    updatedAt: '2025-09-17 16:30:00',
  },
  {
    key: '3',
    name: '示例項目 3',
    status: 'maintenance',
    description: '維護中的項目',
    createdAt: '2025-09-16 09:15:00',
    updatedAt: '2025-09-18 11:20:00',
  },
]

// 默認配置生成器
export const createDataTableConfig = (
  title: string,
  subtitle: string,
  customConfig: Partial<DataTablePageConfig> = {}
): DataTablePageConfig => {
  const data = createExampleData()

  return {
    title,
    subtitle,
    kpiData: [
      {
        title: '總項目數',
        value: data.length.toString(),
        description: '系統中的項目總數',
        status: 'info',
      },
      {
        title: '活躍項目',
        value: data.filter(item => item.status === 'active').length.toString(),
        description: '當前活躍的項目',
        trend: '+12.5%',
        status: 'success',
      },
      {
        title: '待處理項目',
        value: data.filter(item => item.status === 'maintenance').length.toString(),
        description: '需要關注的項目',
        trend: '+2',
        status: 'warning',
      },
    ],
    columns: customConfig.columns || createExampleColumns(
      (record) => console.log('編輯', record.name),
      (record) => console.log('刪除', record.name)
    ),
    dataSource: customConfig.dataSource || data,
    tableProps: {
      loading: false,
      pagination: true,
      ...customConfig.tableProps,
    },
    showRefresh: true,
    showSearch: true,
    showExport: true,
    ...customConfig,
  }
}

// 模板組件
export const DataTablePageTemplate: React.FC<{
  title: string
  subtitle: string
  customConfig?: Partial<DataTablePageConfig>
  children?: React.ReactNode
}> = ({ title, subtitle, customConfig, children }) => {
  const [data, setData] = useState(createExampleData())
  const [loading, setLoading] = useState(false)

  // 事件處理
  const handleRefresh = () => {
    setLoading(true)
    console.log('刷新數據')
    // 模擬 API 調用
    setTimeout(() => {
      setData(createExampleData())
      setLoading(false)
    }, 1000)
  }

  const handleSearch = (searchText: string) => {
    console.log('搜索:', searchText)
    // 這裡可以實現搜索邏輯
  }

  const handleExport = () => {
    console.log('導出數據')
    // 這裡可以實現導出邏輯
  }

  const handleEdit = (record: ExampleData) => {
    console.log('編輯', record.name)
    // 這裡可以實現編輯邏輯
  }

  const handleDelete = (record: ExampleData) => {
    console.log('刪除', record.name)
    // 這裡可以實現刪除邏輯
  }

  const config = createDataTableConfig(title, subtitle, {
    dataSource: data,
    columns: createExampleColumns(handleEdit, handleDelete),
    tableProps: {
      loading,
    },
    onRefresh: handleRefresh,
    onSearch: handleSearch,
    onExport: handleExport,
    ...customConfig,
  })

  return (
    <DataTablePage {...config}>
      {children}
    </DataTablePage>
  )
}

// 導出模板使用示例
export const ExampleListPage = () => {
  return (
    <DataTablePageTemplate
      title="示例列表管理"
      subtitle="這是一個使用 DataTablePage 模板的示例頁面"
    />
  )
}

export default DataTablePageTemplate
