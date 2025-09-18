# 表格欄位與佈局優化方案

## 一、現況分析

### 1.1 現有表格樣式問題

1. **行高不一致**
   - 標準表格：52px
   - 平台表格：48px
   - 增強型表格：36-56px（根據密度）

2. **字體大小混亂**
   - 表頭：11px-12px
   - 內容：12px-14px
   - 缺乏統一規範

3. **內邊距不統一**
   - 標準：12px 16px
   - 緊湊：6px 12px
   - 響應式調整不一致

4. **欄位寬度問題**
   - 固定寬度導致響應式問題
   - 文字截斷處理不一致
   - 操作欄寬度浪費

## 二、優化方案

### 2.1 統一表格密度系統

```css
/* 三種密度模式 */
:root {
  /* 緊湊模式 - 適合大量資料瀏覽 */
  --table-row-height-compact: 36px;
  --table-padding-compact: 6px 12px;
  --table-font-size-compact: 12px;
  
  /* 標準模式 - 預設使用 */
  --table-row-height-standard: 44px;
  --table-padding-standard: 10px 16px;
  --table-font-size-standard: 13px;
  
  /* 舒適模式 - 適合詳細閱讀 */
  --table-row-height-comfortable: 52px;
  --table-padding-comfortable: 14px 20px;
  --table-font-size-comfortable: 14px;
}
```

### 2.2 欄位寬度優化策略

```javascript
// 自適應欄位寬度配置
const columnWidthPresets = {
  // 固定寬度欄位
  checkbox: 48,
  status: 90,
  action: 120,
  
  // 彈性寬度欄位
  id: { min: 80, max: 120 },
  name: { min: 150, max: 300 },
  description: { min: 200, flex: 1 },
  date: { min: 140, max: 180 },
  number: { min: 80, max: 120 },
  tag: { min: 60, max: 100 }
};

// 智慧欄位排序
const columnOrderPriority = {
  primary: ['name', 'title', 'summary'],      // 主要資訊
  secondary: ['status', 'type', 'category'],   // 次要狀態
  metadata: ['created_at', 'updated_at'],      // 元資料
  actions: ['action']                          // 操作欄
};
```

### 2.3 資訊密度優化

#### 移除冗餘資訊
- 將次要資訊移至詳情頁
- 合併相關欄位（如建立人/建立時間）
- 使用圖示代替文字狀態

#### 資訊層次化
```jsx
// 主要資訊突出顯示
<div className="table-cell-primary">
  <div className="cell-title">{record.name}</div>
  <div className="cell-subtitle">{record.description}</div>
</div>

// 次要資訊淡化處理
<span className="table-cell-secondary">
  {record.metadata}
</span>
```

### 2.4 視覺優化規範

```css
/* 統一表格視覺規範 */
.optimized-table {
  /* 表頭樣式 */
  --table-header-bg: var(--bg-elevated);
  --table-header-height: 44px;
  --table-header-font-size: 12px;
  --table-header-font-weight: 600;
  --table-header-text-transform: uppercase;
  --table-header-letter-spacing: 0.6px;
  
  /* 內容樣式 */
  --table-row-hover-bg: var(--bg-hover);
  --table-row-selected-bg: rgba(24, 144, 255, 0.08);
  --table-row-hover-transform: translateX(2px);
  --table-border-color: var(--border-light);
  
  /* 狀態指示器 */
  --table-row-indicator-width: 3px;
  --table-row-indicator-transition: all 0.2s ease;
}
```

## 三、實施建議

### 3.1 欄位顯示優化

#### 事件列表優化
```javascript
// 優化前
columns = ['severity', 'summary', 'resource_name', 'business_impact', 
          'ruleName', 'triggerThreshold', 'status', 'assignee', 
          'created_at', 'action'];

// 優化後
columns = {
  // 永遠顯示
  always: ['severity', 'summary', 'status', 'created_at', 'action'],
  // 桌面版顯示
  desktop: ['resource_name', 'assignee'],
  // 可選顯示
  optional: ['business_impact', 'ruleName', 'triggerThreshold']
};
```

#### 資源列表優化
```javascript
// 合併相關資訊
const resourceColumns = [
  {
    title: '資源資訊',
    render: (record) => (
      <div className="resource-info-cell">
        <div className="resource-name">{record.name}</div>
        <div className="resource-meta">
          <span className="resource-type">{record.type}</span>
          <span className="resource-ip">{record.ip}</span>
        </div>
      </div>
    )
  },
  // ... 其他欄位
];
```

### 3.2 互動體驗優化

#### 快速操作
```jsx
// 行內快速操作
<div className="table-quick-actions">
  <Tooltip title="快速編輯">
    <Button 
      size="small" 
      type="text" 
      icon={<EditOutlined />}
      onClick={(e) => {
        e.stopPropagation();
        handleQuickEdit(record);
      }}
    />
  </Tooltip>
</div>
```

#### 鍵盤導航
```javascript
const tableKeyboardShortcuts = {
  'ArrowUp': 'selectPreviousRow',
  'ArrowDown': 'selectNextRow',
  'Enter': 'openDetail',
  'Space': 'toggleRowSelection',
  'Ctrl+A': 'selectAll',
  'Delete': 'deleteSelected'
};
```

### 3.3 響應式設計

```css
/* 響應式斷點 */
@media (max-width: 1440px) {
  /* 隱藏次要欄位 */
  .table-column-secondary { display: none; }
}

@media (max-width: 1024px) {
  /* 切換到緊湊模式 */
  .platform-table { --current-density: compact; }
  /* 隱藏可選欄位 */
  .table-column-optional { display: none; }
}

@media (max-width: 768px) {
  /* 轉換為卡片視圖 */
  .platform-table-mobile {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
```

## 四、實施步驟

### Phase 1：基礎優化（1週）
1. 統一所有表格行高為 44px（標準模式）
2. 統一字體大小：表頭 12px，內容 13px
3. 調整內邊距：統一使用 10px 16px
4. 移除不必要的欄位寬度限制

### Phase 2：功能增強（2週）
1. 實現三種密度模式切換
2. 添加欄位拖動調整寬度
3. 優化狀態標籤顯示
4. 實現智慧欄位排序

### Phase 3：體驗優化（3週）
1. 添加鍵盤導航支援
2. 實現行內快速編輯
3. 優化響應式顯示
4. 添加個人化設定記憶

## 五、效能考量

### 5.1 虛擬滾動
```jsx
// 大數據量表格使用虛擬滾動
<VirtualTable
  dataSource={largeDataSet}
  height={600}
  itemHeight={44}
  overscan={5}
/>
```

### 5.2 懶加載
```jsx
// 按需載入表格資料
const useTableData = (pageSize = 20) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const newData = await fetchData({ 
      offset: data.length, 
      limit: pageSize 
    });
    
    setData(prev => [...prev, ...newData]);
    setHasMore(newData.length === pageSize);
    setLoading(false);
  }, [data.length, loading, hasMore, pageSize]);
  
  return { data, loading, hasMore, loadMore };
};
```

## 六、測量指標

### 6.1 可讀性指標
- 每頁可顯示行數提升 20%
- 重要資訊識別速度提升 30%
- 錯誤操作率降低 15%

### 6.2 效能指標
- 首次渲染時間 < 200ms
- 滾動流暢度 60fps
- 互動響應時間 < 100ms

### 6.3 使用者滿意度
- 資訊查找效率提升
- 視覺疲勞度降低
- 整體滿意度評分 > 4.5/5

## 七、最佳實踐總結

1. **保持一致性**：所有表格使用統一的視覺規範
2. **適應性設計**：根據內容類型調整顯示方式
3. **效能優先**：大數據量時使用虛擬滾動
4. **人員控制**：允許人員自定義顯示偏好
5. **漸進增強**：基礎功能優先，進階功能可選