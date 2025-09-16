# SRE 平台組件使用指南

## 🎯 核心設計原則

1. **一致性**: 所有組件遵循統一的視覺語言和交互模式
2. **可訪問性**: 支援鍵盤導航和屏幕閱讀器
3. **響應式**: 適應不同螢幕尺寸
4. **效能優化**: 使用 React.memo 優化渲染性能

## 📦 核心組件

### 1. PlatformButton - 統一按鈕組件

#### 基本用法
```jsx
<PlatformButton 
  variant="primary"
  size="medium"
  icon={<PlusOutlined />}
  onClick={handleClick}
>
  新增
</PlatformButton>
```

#### Props
- `variant`: 'primary' | 'secondary' | 'danger' | 'text' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- `icon`: React 節點（可選）
- `loading`: boolean
- `disabled`: boolean
- `tooltip`: string（可選）
- `htmlType`: 'button' | 'submit' | 'reset'

#### 使用場景
- **primary**: 主要操作，如新增、提交
- **secondary**: 次要操作，如取消、返回
- **danger**: 危險操作，如刪除
- **text**: 文字按鈕，用於表格內操作
- **ghost**: 工具列按鈕

### 2. PlatformModal - 統一彈窗組件

#### 基本用法
```jsx
<PlatformModal
  title="新增資源"
  open={isModalOpen}
  onCancel={handleCancel}
  onOk={handleSubmit}
  size="medium"
  icon={<PlusOutlined />}
>
  {/* Modal 內容 */}
</PlatformModal>
```

#### Props
- `title`: string
- `open` / `visible`: boolean（支援兩種）
- `onCancel` / `onClose`: function
- `onOk`: function
- `size`: 'small' | 'medium' | 'large' | 'xlarge'
- `icon`: React 節點（可選）
- `footer`: 自定義 footer（預設使用 ModalActions）
- `confirmLoading`: boolean

#### 尺寸規範
- small: 480px
- medium: 600px（預設）
- large: 800px
- xlarge: 1000px

### 3. AdvancedFilterPanel - 進階篩選器

#### 基本用法
```jsx
<AdvancedFilterPanel
  filters={currentFilters}
  onFilterChange={handleFilterChange}
  filterConfig={[
    {
      field: 'status',
      label: '狀態',
      type: 'multiSelect',
      placeholder: '選擇狀態',
      options: [
        { value: 'active', label: '活躍' },
        { value: 'inactive', label: '停用' }
      ]
    },
    {
      field: 'dateRange',
      label: '日期範圍',
      type: 'dateRange'
    }
  ]}
/>
```

#### 支援的篩選器類型
- `text`: 文字輸入
- `select`: 單選下拉選單
- `multiSelect`: 多選下拉選單
- `dateRange`: 日期範圍選擇器
- `number`: 數字輸入

#### filterConfig 屬性
- `field`: 欄位名稱
- `label`: 顯示標籤
- `type`: 篩選器類型
- `placeholder`: 佔位文字
- `options`: 選項列表（select/multiSelect）
- `required`: 是否必填
- `description`: 說明文字
- `renderOption`: 自定義選項渲染

### 4. TableDensitySwitcher - 表格密度切換器

#### 基本用法
```jsx
const [tableDensity, setTableDensity] = useState('standard');

<TableDensitySwitcher 
  density={tableDensity}
  onChange={setTableDensity}
/>

<div className={`table-wrapper table-density-${tableDensity}`}>
  <Table {...tableProps} />
</div>
```

#### 密度選項
- `compact`: 緊湊模式 - 適合大量資料瀏覽
- `standard`: 標準模式 - 預設平衡選項
- `comfortable`: 舒適模式 - 更多空間和可讀性

### 5. TableRowActions - 表格行操作組

#### 基本用法
```jsx
<TableRowActions 
  record={record}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  customActions={[
    {
      icon: <CopyOutlined />,
      tooltip: '複製',
      onClick: handleCopy
    }
  ]}
/>
```

### 6. ModalActions - Modal 底部操作組

#### 基本用法
```jsx
<ModalActions 
  onCancel={handleCancel}
  onConfirm={handleConfirm}
  confirmText="提交"
  cancelText="取消"
  confirmLoading={isSubmitting}
/>
```

## 🎨 設計系統變數

### 顏色變數
```css
--brand-primary: #1890ff
--brand-primary-hover: #40a9ff
--brand-success: #52c41a
--brand-danger: #ff4d4f
--brand-warning: #faad14
```

### 間距系統
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

### 按鈕尺寸
```css
--btn-height-sm: 28px
--btn-height-md: 36px
--btn-height-lg: 44px
```

## 💡 最佳實踐

### 1. 按鈕使用規範
- 頁面級主要操作使用 `primary` variant
- 表格內操作使用 `text` variant 配合圖標
- 危險操作必須使用 `danger` variant
- 工具列操作使用 `ghost` variant

### 2. Modal 使用建議
- 始終提供明確的標題
- 使用適當的 size，避免內容擁擠
- 複雜表單考慮分步驟展示
- 確保有清晰的取消和確認操作

### 3. 篩選器配置
- 常用篩選條件放在前面
- 使用合適的篩選器類型
- 提供清晰的標籤和說明
- 支援重設功能

### 4. 表格密度
- 預設使用 standard 模式
- 記憶用戶選擇（使用 localStorage）
- 資料密集型頁面提供切換選項

## 📋 遷移指南

### 從 Ant Design Button 遷移到 PlatformButton
```jsx
// 舊代碼
<Button type="primary" icon={<PlusOutlined />}>
  新增
</Button>

// 新代碼
<PlatformButton variant="primary" icon={<PlusOutlined />}>
  新增
</PlatformButton>
```

### 從普通 Modal 遷移到 PlatformModal
```jsx
// 舊代碼
<Modal
  title="標題"
  visible={visible}
  onCancel={handleCancel}
  onOk={handleOk}
>
  內容
</Modal>

// 新代碼
<PlatformModal
  title="標題"
  open={visible}
  onCancel={handleCancel}
  onOk={handleOk}
  size="medium"
>
  內容
</PlatformModal>
```

## 🔧 疑難排解

### 問題：按鈕樣式不正確
- 檢查是否正確引入了 CSS 變數
- 確保使用正確的 variant 值
- 檢查是否有樣式覆蓋

### 問題：Modal 尺寸不合適
- 使用預定義的 size 而非自定義 width
- 考慮內容量選擇合適的 size
- 必要時使用 xlarge 尺寸

### 問題：篩選器不工作
- 確保 filterConfig 配置正確
- 檢查 onFilterChange 回調函數
- 驗證篩選條件的欄位名稱匹配

## 📚 延伸閱讀

- [Ant Design 設計語言](https://ant.design/docs/spec/introduce)
- [React 效能優化最佳實踐](https://react.dev/learn/render-and-commit)
- [無障礙設計指南](https://www.w3.org/WAI/WCAG21/quickref/)