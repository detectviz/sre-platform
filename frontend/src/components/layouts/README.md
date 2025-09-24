# Layout Components Documentation

## 概述

這是一個模組化的佈局系統，專為 SRE 平台設計，提供了多種專門的佈局組件來滿足不同類型頁面的需求。

## 架構設計

```
BaseLayout (基礎佈局)
├── StandardLayout (標準頁面佈局)
├── TableLayout (表格頁面佈局)
├── FormLayout (表單頁面佈局)
├── DashboardLayout (儀表板佈局)
└── DetailLayout (詳情頁面佈局)
```

## 組件詳述

### BaseLayout

**描述**: 所有佈局組件的核心基礎，提供基本的頁面結構和通用功能。

**功能特性**:
- 響應式設計
- 側邊欄管理
- 載入狀態處理
- 錯誤狀態處理

**API**:
```tsx
<BaseLayout
  header={<div>頁面標題</div>}
  content={<div>頁面內容</div>}
  sidebar={<div>側邊欄</div>}
  config={{
    spacing: { content: '16px' },
    sidebar: { show: true, width: 300, position: 'left' }
  }}
/>
```

### StandardLayout

**描述**: 適用於大多數標準頁面的佈局，包含 KPI 卡片、工具列和標籤頁。

**適用場景**:
- 首頁
- 設定頁面
- 統計頁面

**API**:
```tsx
<StandardLayout
  header={<div>頁面標題</div>}
  content={<div>主要內容</div>}
  config={{
    kpiCards: <KPICards />,
    toolbar: <ToolbarActions />,
    tabs: <Tabs />
  }}
/>
```

### TableLayout

**描述**: 專為表格頁面設計的佈局，優化表格顯示和操作體驗。

**適用場景**:
- 列表管理頁面
- 數據展示頁面

**API**:
```tsx
<TableLayout
  header={<div>表格標題</div>}
  content={
    <Table
      columns={columns}
      dataSource={data}
      pagination={DEFAULT_PAGINATION}
    />
  }
  config={{
    toolbar: <ToolbarActions actions={actions} filters={filters} />,
    showTabs: false
  }}
/>
```

### FormLayout

**描述**: 專為表單頁面設計的佈局，優化表單填寫體驗。

**適用場景**:
- 新增/編輯頁面
- 設定頁面

**API**:
```tsx
<FormLayout
  header={<div>表單標題</div>}
  content={<Form>表單內容</Form>}
  config={{
    actions: <Button>提交</Button>,
    formContainer: { size: 'large' }
  }}
/>
```

### DashboardLayout

**描述**: 專為儀表板設計的佈局，支持網格佈局和面板配置。

**適用場景**:
- 監控儀表板
- 統計儀表板

**API**:
```tsx
<DashboardLayout
  header={<div>儀表板標題</div>}
  content={
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card>面板1</Card>
      <Card>面板2</Card>
      <Card>面板3</Card>
    </div>
  }
  config={{
    kpiCards: <KPICards />,
    gridLayout: { columns: 3, gutter: [16, 16] }
  }}
/>
```

### DetailLayout

**描述**: 專為詳情頁面設計的佈局，提供詳細信息展示和側邊欄。

**適用場景**:
- 資源詳情頁面
- 用戶詳情頁面
- 事件詳情頁面

**API**:
```tsx
<DetailLayout
  header={<div>詳情標題</div>}
  content={
    <Descriptions>
      <Descriptions.Item label="名稱">內容</Descriptions.Item>
    </Descriptions>
  }
  sidebar={
    <Card title="相關信息">
      <div>側邊欄內容</div>
    </Card>
  }
  config={{
    metaInfo: <div>元信息</div>,
    sidebarSections: {
      showRelated: true,
      showTags: true,
      related: <div>相關項目</div>,
      tags: <div>標籤</div>
    }
  }}
/>
```

## 使用指南

### 1. 選擇合適的佈局

根據頁面類型選擇對應的佈局組件：

- **列表頁面** → TableLayout
- **表單頁面** → FormLayout
- **儀表板** → DashboardLayout
- **詳情頁面** → DetailLayout
- **標準頁面** → StandardLayout

### 2. 配置組件

使用 config 屬性來配置佈局行為：

```tsx
const config = {
  spacing: { content: '16px' },
  sidebar: { show: true, width: 300 },
  toolbar: <ToolbarActions />
}
```

### 3. 組合使用

可以將不同佈局組件組合使用：

```tsx
const DashboardWithDetails = () => (
  <DashboardLayout
    header={<div>儀表板</div>}
    content={
      <DetailLayout
        header={<div>詳情</div>}
        content={<div>詳細內容</div>}
      />
    }
  />
)
```

## 最佳實踐

1. **保持一致性**: 在相同類型的頁面中使用相同的佈局組件
2. **合理配置**: 根據頁面需求配置必要的屬性，避免過度配置
3. **響應式設計**: 利用內建的響應式功能，確保在不同螢幕尺寸下正常顯示
4. **性能優化**: 對於複雜的佈局，考慮使用 React.memo 優化渲染性能

## 擴展性

### 自定義佈局

可以基於 BaseLayout 創建自定義佈局：

```tsx
interface CustomLayoutConfig extends BaseLayoutConfig {
  customFeature: ReactNode
}

export const CustomLayout: React.FC<CustomLayoutProps> = ({ config, ...props }) => (
  <BaseLayout
    {...props}
    config={{
      ...config,
      content: (
        <div>
          {config.customFeature}
          {config.content}
        </div>
      )
    }}
  />
)
```

### 佈局工廠

使用佈局工廠快速創建佈局：

```tsx
const createCustomLayout = (type: LayoutType, config: LayoutConfig) => {
  switch (type) {
    case 'table':
      return <TableLayout {...config} />
    case 'dashboard':
      return <DashboardLayout {...config} />
    default:
      return <StandardLayout {...config} />
  }
}
```

## 測試策略

### 單元測試

我們為每個佈局組件提供了完整的單元測試覆蓋：

#### BaseLayout 測試覆蓋
- ✅ 基本渲染測試 - 驗證 header、content 和 sidebar 的正確渲染
- ✅ 載入狀態測試 - 確保載入狀態正確顯示 LoadingSkeleton
- ✅ 錯誤狀態測試 - 驗證錯誤狀態正確顯示 ErrorFallback
- ✅ 側邊欄配置測試 - 測試側邊欄顯示位置和寬度配置
- ✅ 間距配置測試 - 驗證不同間距配置的應用
- ✅ 響應式佈局測試 - 確保響應式類別正確應用

#### TableLayout 測試覆蓋
- ✅ 工具列渲染測試 - 驗證工具列按鈕和篩選器正確顯示
- ✅ 篩選器功能測試 - 測試篩選器選項的渲染和互動
- ✅ 搜尋功能測試 - 確保搜尋輸入框正常工作
- ✅ KPI 卡片測試 - 驗證 KPI 卡片資料正確顯示
- ✅ 標籤頁測試 - 測試標籤頁的渲染和切換

#### FormLayout 測試覆蓋
- ✅ 表單渲染測試 - 驗證表單欄位和標籤正確顯示
- ✅ 表單動作測試 - 測試提交、取消、重置按鈕功能
- ✅ 表單驗證測試 - 確保表單驗證規則正常工作
- ✅ 表單容器測試 - 驗證不同容器配置的應用

### 測試執行

```bash
# 執行所有佈局組件測試
npm test -- src/components/layouts/__tests__/

# 執行特定組件測試
npm test -- src/components/layouts/__tests__/BaseLayout.test.tsx
npm test -- src/components/layouts/__tests__/TableLayout.test.tsx
npm test -- src/components/layouts/__tests__/FormLayout.test.tsx

# 執行測試並生成覆蓋率報告
npm test -- --coverage --testPathPattern=src/components/layouts/__tests__/
```

### 測試最佳實踐

1. **隔離測試**: 每個測試檔案專注於單一組件
2. **模擬依賴**: 使用 jest.mock 模擬外部依賴
3. **事件測試**: 測試用戶互動和回調函數
4. **邊界測試**: 測試組件在極端條件下的行為
5. **可訪問性測試**: 確保組件符合無障礙標準

## 效能優化

### 1. React.memo 使用

```tsx
export const OptimizedTableLayout = React.memo(TableLayout)
export const OptimizedDashboardLayout = React.memo(DashboardLayout)
```

### 2. Lazy Loading

```tsx
const TableLayout = lazy(() => import('./layouts/TableLayout'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
```

### 3. 虛擬化支持

對於大型列表頁面，TableLayout 支持虛擬滾動：

```tsx
<TableLayout
  config={{
    virtualScroll: {
      height: 600,
      itemHeight: 54
    }
  }}
/>
```

## 故障排除

### 常見問題

1. **佈局不響應**
   - 檢查是否正確設置了響應式配置
   - 確保容器有正確的 CSS 樣式

2. **側邊欄不顯示**
   - 檢查 sidebar.show 是否為 true
   - 確認側邊欄內容不為空

3. **TypeScript 錯誤**
   - 確保正確導入了組件類型
   - 檢查配置對象的類型匹配

### 調試模式

開啟調試模式來查看佈局邊界：

```tsx
<BaseLayout
  config={{
    debug: true,
    showBoundaries: true
  }}
/>
```

## 版本歷史

### v2.0.0 (最新)
- ✅ 完全重構為模組化架構
- ✅ 添加完整的 TypeScript 支持
- ✅ 實現響應式設計
- ✅ 添加單元測試覆蓋 (3個核心組件)
- ✅ 提供完整文檔和使用指南

### v1.0.0
- 初始版本
- 單一 PageLayout 組件
- 基本佈局功能