# DataTablePage 高階組件

DataTablePage 是一個統一的列表頁面模板組件，用於快速構建具有標準功能的列表頁面，包括 KPI 卡片、工具列、表格等功能。

## 🚀 主要特性

- 📊 **KPI 卡片**: 支持顯示關鍵指標數據
- 🔧 **工具列**: 統一的刷新、搜索、導出、新增功能
- 📋 **表格**: 統一的表格樣式和分頁
- 🏷️ **分類篩選**: 可選的分類篩選功能
- 📑 **Tabs 支持**: 可選的標籤頁支持
- 🎨 **統一樣式**: 使用統一的設計系統

## 📖 使用方法

### 基本使用

```tsx
import DataTablePage from '../components/DataTablePage'

const MyPage = () => {
  return (
    <DataTablePage
      title="頁面標題"
      subtitle="頁面描述"
      kpiData={[
        {
          title: '總項目數',
          value: '156',
          description: '系統中的項目總數',
          status: 'info',
        },
        {
          title: '活躍項目',
          value: '89',
          description: '當前活躍的項目',
          trend: '+12.1%',
          status: 'success',
        },
      ]}
      columns={[
        { title: '名稱', dataIndex: 'name', key: 'name' },
        { title: '狀態', dataIndex: 'status', key: 'status' },
        {
          title: '操作',
          key: 'action',
          render: (_, record) => (
            <Button onClick={() => console.log('編輯', record.name)}>
              編輯
            </Button>
          ),
        },
      ]}
      dataSource={data}
      showRefresh={true}
      showSearch={true}
      showExport={true}
      onRefresh={() => console.log('刷新')}
      onSearch={(searchText) => console.log('搜索:', searchText)}
      onExport={() => console.log('導出')}
    />
  )
}
```

### 帶分類篩選

```tsx
<DataTablePage
  title="儀表板管理"
  subtitle="統一管理業務儀表板、SRE 戰情室和基礎設施洞察面板"
  kpiData={kpiData}
  columns={columns}
  dataSource={filteredData}
  categoryFilter={{
    categories: [
      { key: 'all', label: '全部', count: dashboardData.length },
      { key: 'infrastructure', label: '基礎設施洞察', count: infrastructureCount },
      { key: 'business', label: '業務與 SLA 指標', count: businessCount },
    ],
    onCategoryChange: (category) => setSelectedCategory(category),
    selectedCategory,
  }}
  toolbarActions={[
    {
      key: 'add',
      label: '新增儀表板',
      icon: <PlusOutlined />,
      type: 'primary',
      onClick: () => console.log('新增儀表板'),
    },
  ]}
/>
```

### 帶 Tabs 的頁面

```tsx
const tabItems = [
  {
    key: 'users',
    label: '人員管理',
    icon: <UserOutlined />,
    children: (
      <DataTablePage
        title=""
        subtitle=""
        kpiData={userKpiData}
        columns={userColumns}
        dataSource={userData}
      />
    ),
  },
  {
    key: 'teams',
    label: '團隊管理',
    icon: <TeamOutlined />,
    children: (
      <DataTablePage
        title=""
        subtitle=""
        kpiData={teamKpiData}
        columns={teamColumns}
        dataSource={teamData}
      />
    ),
  },
]

return <Tabs items={tabItems} />
```

## 🔧 API 接口

### DataTablePageConfig<T>

| 屬性 | 類型 | 描述 |
|------|------|------|
| `title` | `string` | 頁面標題 |
| `subtitle` | `string` | 頁面副標題 |
| `kpiData` | `KPICardData[]` | KPI 卡片數據 |
| `columns` | `ColumnsType<T>` | 表格列配置 |
| `dataSource` | `T[]` | 表格數據源 |
| `tableProps` | `TableProps` | 表格額外屬性 |
| `toolbarActions` | `ToolbarAction[]` | 自定義工具列動作 |
| `showRefresh` | `boolean` | 是否顯示刷新按鈕 |
| `showSearch` | `boolean` | 是否顯示搜索功能 |
| `showExport` | `boolean` | 是否顯示導出按鈕 |
| `categoryFilter` | `CategoryFilterConfig` | 分類篩選配置 |
| `tabs` | `TabConfig[]` | 標籤頁配置 |
| `onRefresh` | `() => void` | 刷新回調 |
| `onSearch` | `(searchText: string) => void` | 搜索回調 |
| `onExport` | `() => void` | 導出回調 |
| `onAdd` | `() => void` | 新增回調 |

### KPICardData

| 屬性 | 類型 | 描述 |
|------|------|------|
| `title` | `string` | KPI 標題 |
| `value` | `string` | KPI 數值 |
| `description` | `string` | KPI 描述 |
| `trend` | `string` | 趨勢（如 "+12.5%", "-3%"） |
| `status` | `'success' \| 'warning' \| 'danger' \| 'info'` | KPI 狀態 |

### ToolbarAction

| 屬性 | 類型 | 描述 |
|------|------|------|
| `key` | `string` | 動作唯一標識 |
| `label` | `string` | 動作標籤 |
| `icon` | `ReactNode` | 動作圖標 |
| `onClick` | `() => void` | 點擊回調 |
| `type` | `string` | 按鈕類型 |
| `danger` | `boolean` | 是否為危險按鈕 |
| `disabled` | `boolean` | 是否禁用 |
| `loading` | `boolean` | 是否顯示加載狀態 |

## 🛠️ 模板組件

### DataTablePageTemplate

提供了一個開箱即用的模板組件：

```tsx
import { DataTablePageTemplate } from '../components/DataTablePage'

const MyPage = () => {
  return (
    <DataTablePageTemplate
      title="示例列表管理"
      subtitle="這是一個使用 DataTablePage 模板的示例頁面"
    />
  )
}
```

## 📝 使用建議

1. **數據類型**: 定義清晰的數據接口和類型
2. **事件處理**: 統一處理刷新、搜索、導出等事件
3. **狀態管理**: 使用 React hooks 管理組件狀態
4. **性能優化**: 對於大數據量，考慮使用虛擬滾動
5. **可訪問性**: 確保表格和操作的可訪問性

## 🎯 最佳實踐

- 保持數據結構的一致性
- 使用有意義的 key 值
- 提供適當的加載狀態
- 處理錯誤狀態
- 保持組件的可測試性
