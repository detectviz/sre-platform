# 系統設定頁面統一佈局規範

## 一、設定頁面佈局模式

### 1.1 標準佈局結構

```jsx
<SettingsLayout>
  <SettingsSection 
    title="區塊標題"
    description="區塊說明文字"
    actions={<操作按鈕組 />}
  >
    <SettingsFormRow 
      label="設定項目名稱"
      description="設定項目說明"
      required={是否必填}
    >
      {/* 表單控件 */}
    </SettingsFormRow>
  </SettingsSection>
</SettingsLayout>
```

### 1.2 佈局元件層級

1. **SettingsLayout** - 最外層容器
   - 最大寬度：1200px
   - 自動居中對齊
   - 內邊距：24px

2. **SettingsSection** - 設定區塊
   - 玻璃擬態背景效果
   - 圓角：12px
   - 內邊距：24px
   - 區塊間距：24px
   - 標題區與內容區以分隔線區分

3. **SettingsFormRow** - 表單行
   - 網格佈局：標籤欄 1fr，控件欄 2fr
   - 欄間距：24px
   - 行間距：16px
   - 標籤靠右對齊（桌面版）

### 1.3 視覺層次

```
頁面標題 (32px, font-weight: 600)
└── 區塊標題 (20px, font-weight: 600)
    ├── 區塊說明 (14px, color: tertiary)
    └── 設定項目
        ├── 標籤 (14px, font-weight: 500)
        ├── 說明 (13px, color: tertiary)
        └── 控件 (14px)
```

## 二、共通設計模式

### 2.1 表單控件規範

**輸入框類**
- 高度：32px（標準尺寸）
- 圓角：6px
- 邊框：1px solid rgba(255, 255, 255, 0.12)
- 聚焦時邊框顏色：var(--brand-primary)

**選擇器類**
- 下拉選單：保持與輸入框一致的視覺風格
- 多選框組：垂直排列，行間距 8px
- 開關：使用於是/否的二元選項

**數值類**
- InputNumber：支援單位後綴
- Slider：用於範圍選擇，顯示當前值

### 2.2 操作按鈕配置

**頁面級操作**（右上角）
- 主要操作：「儲存設定」（primary button）
- 次要操作：「還原預設值」、「取消」

**區塊級操作**（區塊標題右側）
- 匯入/匯出
- 重新整理
- 展開/收合

**行內操作**（設定項目右側）
- 測試連線
- 預覽效果
- 重設單項

### 2.3 驗證與回饋

**即時驗證**
- 輸入時：格式檢查（如 Email、URL）
- 失焦時：完整性檢查
- 提交時：整體驗證

**錯誤提示**
- 行內錯誤：紅色文字，顯示在控件下方
- 區塊錯誤：Alert 元件
- 操作錯誤：message.error()

**成功回饋**
- 儲存成功：message.success()
- 自動儲存：靜默儲存，顯示「已自動儲存」標籤

## 三、響應式設計

### 3.1 桌面版（>1024px）
- 標準三欄佈局
- 側邊導航固定
- 完整功能展示

### 3.2 平板版（768px - 1024px）
- 兩欄佈局：標籤與控件垂直排列
- 側邊導航可收合
- 保留核心功能

### 3.3 手機版（<768px）
- 單欄佈局
- 標籤在控件上方
- 精簡操作按鈕
- 使用 Drawer 代替側邊導航

## 四、常見設定頁面模式

### 4.1 基本資訊設定
```jsx
<SettingsSection title="基本資訊">
  <SettingsFormRow label="系統名稱" required>
    <Input />
  </SettingsFormRow>
  <SettingsFormRow label="系統描述">
    <Input.TextArea rows={3} />
  </SettingsFormRow>
</SettingsSection>
```

### 4.2 通知設定
```jsx
<SettingsSection title="通知設定">
  <SettingsFormRow label="啟用通知">
    <Switch />
  </SettingsFormRow>
  <SettingsFormRow label="通知管道">
    <Select mode="multiple" />
  </SettingsFormRow>
  <SettingsFormRow label="通知頻率">
    <Radio.Group />
  </SettingsFormRow>
</SettingsSection>
```

### 4.3 進階設定（可摺疊）
```jsx
<Collapse defaultActiveKey={['basic']}>
  <Collapse.Panel header="基本設定" key="basic">
    {/* 基本設定內容 */}
  </Collapse.Panel>
  <Collapse.Panel header="進階設定" key="advanced">
    {/* 進階設定內容 */}
  </Collapse.Panel>
</Collapse>
```

### 4.4 列表型設定
```jsx
<SettingsSection 
  title="API 金鑰管理"
  actions={<Button icon={<PlusOutlined />}>新增金鑰</Button>}
>
  <Table 
    columns={[...]}
    dataSource={[...]}
    size="small"
  />
</SettingsSection>
```

## 五、特殊場景處理

### 5.1 危險操作
- 使用紅色警告區塊
- 需要二次確認
- 顯示操作後果說明

### 5.2 相依設定
- 動態顯示/隱藏相關設定
- 使用縮排表示層級關係
- 禁用狀態的視覺區分

### 5.3 即時預覽
- 分割版面：左側設定，右側預覽
- 預覽區域使用淺色背景區分
- 支援即時更新

## 六、最佳實踐

### 6.1 分組原則
- 相關設定項目歸為同一區塊
- 常用設定優先顯示
- 危險操作獨立區塊

### 6.2 標籤文案
- 簡潔明確，避免技術術語
- 使用主動語態
- 保持一致的語言風格

### 6.3 預設值設計
- 提供合理的預設值
- 支援一鍵還原
- 顯示當前值與預設值的差異

### 6.4 幫助資訊
- 複雜設定提供詳細說明
- 支援展開更多資訊
- 連結到相關文檔

## 七、實施檢查清單

- [ ] 使用統一的 SettingsLayout 結構
- [ ] 保持一致的視覺層次
- [ ] 實現合適的表單驗證
- [ ] 提供清晰的操作回饋
- [ ] 支援響應式佈局
- [ ] 優化鍵盤導航體驗
- [ ] 處理載入和錯誤狀態
- [ ] 實現自動儲存（如適用）
- [ ] 提供還原預設值功能
- [ ] 確保無障礙性支援