# 全域操作元素設計規範

## 一、按鈕系統架構

### 1.1 按鈕變體（Variants）

```javascript
// 按鈕變體定義
const ButtonVariants = {
  primary: '主要操作按鈕',     // 藍色填充
  secondary: '次要操作按鈕',   // 邊框按鈕
  danger: '危險操作按鈕',      // 紅色填充
  ghost: '幽靈按鈕',           // 淺色邊框
  text: '文字按鈕'             // 無邊框
};
```

### 1.2 按鈕尺寸（Sizes）

```javascript
const ButtonSizes = {
  small: {
    height: '28px',
    padding: '0 12px',
    fontSize: '12px'
  },
  medium: {
    height: '36px',
    padding: '0 16px',
    fontSize: '14px'
  },
  large: {
    height: '44px',
    padding: '0 32px',
    fontSize: '16px'
  }
};
```

### 1.3 統一使用 PlatformButton 元件

```jsx
// 標準用法
<PlatformButton 
  variant="primary"
  size="medium"
  icon={<PlusOutlined />}
  loading={false}
  disabled={false}
  tooltip="新增資源"
  onClick={handleClick}
>
  新增
</PlatformButton>
```

## 二、使用場景規範

### 2.1 頁面級主要操作

**位置**：頁面右上角或工具列右側  
**樣式**：primary variant + medium size  
**範例**：
```jsx
// 新增按鈕
<PlatformButton variant="primary" icon={<PlusOutlined />}>
  新增資源
</PlatformButton>

// 儲存按鈕
<PlatformButton variant="primary" icon={<SaveOutlined />}>
  儲存設定
</PlatformButton>
```

### 2.2 表格行操作

**位置**：表格最後一欄  
**樣式**：text variant + small size  
**佈局**：使用 TableRowActions 元件包裹

```jsx
<TableRowActions
  record={record}
  onView={handleView}     // 查看
  onEdit={handleEdit}     // 編輯
  onDelete={handleDelete} // 刪除
  customActions={[        // 自定義操作
    {
      icon: <CopyOutlined />,
      tooltip: '複製',
      onClick: handleCopy
    }
  ]}
/>
```

### 2.3 工具列操作

**位置**：列表上方工具列  
**佈局**：左側次要操作，右側主要操作  
**樣式**：
- 次要操作：ghost variant + small size
- 主要操作：primary variant + medium size

```jsx
<ToolbarActions
  onRefresh={handleRefresh}       // 重新整理
  onFilter={handleFilter}         // 篩選
  onExport={handleExport}         // 匯出
  onAdd={handleAdd}               // 新增
  filterActive={hasActiveFilters} // 篩選狀態
  customActions={[]}              // 自定義操作
/>
```

### 2.4 批次操作

**觸發**：選中列表項目時動態顯示  
**位置**：列表上方或下方  
**樣式**：secondary variant + small size

```jsx
<BatchActionToolbar
  selectedCount={selectedRowKeys.length}
  onClear={clearSelection}
  actions={[
    {
      text: '批次刪除',
      icon: <DeleteOutlined />,
      variant: 'danger',
      onClick: handleBatchDelete
    },
    {
      text: '批次匯出',
      icon: <DownloadOutlined />,
      onClick: handleBatchExport
    }
  ]}
/>
```

### 2.5 Modal 操作

**位置**：Modal footer  
**佈局**：左側次要操作，右側主要操作  
**樣式**：
- 取消：secondary variant
- 確認：primary variant

```jsx
<ModalActions
  onCancel={handleCancel}
  onConfirm={handleConfirm}
  confirmText="確定"
  cancelText="取消"
  confirmLoading={loading}
  confirmDisabled={!isValid}
/>
```

## 三、視覺設計規範

### 3.1 顏色系統

```css
/* 主要按鈕 */
--btn-primary-bg: #1890ff;
--btn-primary-bg-hover: #40a9ff;
--btn-primary-text: white;

/* 次要按鈕 */
--btn-secondary-border: rgba(255, 255, 255, 0.12);
--btn-secondary-bg-hover: rgba(255, 255, 255, 0.08);
--btn-secondary-text: rgba(255, 255, 255, 0.85);

/* 危險按鈕 */
--btn-danger-bg: #ff4d4f;
--btn-danger-bg-hover: #ff7875;
--btn-danger-text: white;

/* 文字按鈕 */
--btn-text-color: rgba(255, 255, 255, 0.65);
--btn-text-color-hover: rgba(255, 255, 255, 0.85);
--btn-text-bg-hover: rgba(255, 255, 255, 0.08);
```

### 3.2 互動效果

```css
/* 懸停效果 */
button:hover {
  transform: translateY(-1px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 點擊效果 */
button:active {
  transform: scale(0.98);
}

/* 載入狀態 */
button[loading] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 禁用狀態 */
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

### 3.3 圖示使用

- 圖示與文字間距：4px
- 純圖示按鈕：寬高相等
- 圖示大小：隨按鈕尺寸調整

```jsx
// 圖示 + 文字
<PlatformButton icon={<EditOutlined />}>
  編輯
</PlatformButton>

// 純圖示（需要 tooltip）
<PlatformButton 
  icon={<DeleteOutlined />} 
  tooltip="刪除"
/>
```

## 四、統一性檢查清單

### 4.1 必須統一的項目

- [ ] **元件使用**：所有按鈕必須使用 PlatformButton
- [ ] **尺寸規範**：遵循 small/medium/large 三種尺寸
- [ ] **顏色規範**：使用預定義的變體，不自定義顏色
- [ ] **圖示規範**：使用 Ant Design Icons
- [ ] **載入狀態**：使用 loading 屬性，不自定義 Spin
- [ ] **禁用狀態**：使用 disabled 屬性
- [ ] **Tooltip**：純圖示按鈕必須有 tooltip

### 4.2 避免的做法

- ❌ 直接使用 Ant Design Button
- ❌ 自定義 style 修改按鈕樣式
- ❌ 使用不一致的尺寸
- ❌ 混用不同的圖示庫
- ❌ 在按鈕內嵌套複雜元件

## 五、特殊場景處理

### 5.1 下拉按鈕

```jsx
<Dropdown menu={{ items: menuItems }}>
  <PlatformButton variant="secondary">
    更多操作 <DownOutlined />
  </PlatformButton>
</Dropdown>
```

### 5.2 按鈕組

```jsx
<Space size="small">
  <PlatformButton>上一步</PlatformButton>
  <PlatformButton variant="primary">下一步</PlatformButton>
</Space>
```

### 5.3 切換按鈕

```jsx
<Space size="small">
  <PlatformButton 
    variant={view === 'list' ? 'primary' : 'ghost'}
    onClick={() => setView('list')}
  >
    列表視圖
  </PlatformButton>
  <PlatformButton 
    variant={view === 'card' ? 'primary' : 'ghost'}
    onClick={() => setView('card')}
  >
    卡片視圖
  </PlatformButton>
</Space>
```

## 六、無障礙性要求

### 6.1 鍵盤支援
- Tab：聚焦到按鈕
- Enter/Space：觸發點擊
- Esc：取消操作（如 Modal 中）

### 6.2 ARIA 屬性
```jsx
<PlatformButton
  aria-label="刪除資源"
  aria-pressed={isSelected}
  aria-disabled={disabled}
/>
```

### 6.3 焦點管理
- 明確的焦點指示器
- 合理的 Tab 順序
- 自動焦點到重要按鈕

## 七、響應式設計

### 7.1 手機版適配
- 增大點擊區域（最小 44x44px）
- 調整按鈕間距
- 隱藏次要操作

### 7.2 觸控優化
```css
@media (hover: none) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## 八、效能最佳化

### 8.1 防抖與節流
```jsx
const debouncedClick = useMemo(
  () => debounce(handleClick, 300),
  [handleClick]
);

<PlatformButton onClick={debouncedClick}>
  搜尋
</PlatformButton>
```

### 8.2 載入狀態管理
- 避免重複提交
- 顯示進度回饋
- 處理超時情況

## 九、實施建議

### 9.1 遷移策略
1. 建立 PlatformButton 元件
2. 逐頁替換現有按鈕
3. 統一測試驗證
4. 移除舊樣式

### 9.2 開發工具
- ESLint 規則：禁止直接使用 Button
- Storybook：展示所有按鈕變體
- 視覺回歸測試：確保一致性

### 9.3 文檔維護
- 保持設計規範更新
- 記錄特殊案例
- 提供程式碼範例