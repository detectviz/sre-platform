# SRE 平台重構 TODO 清單

## 📋 冗餘程式碼清理任務

### 🚨 高優先級 (立即處理)

#### 1. 移除 Debug Console 語句 ✅ 已完成
- [x] 移除 `console.log("Rule Submitted:", values)` (原行 6562)
- [x] 移除 `console.warn('無法找到目標輸入框，請確保已選擇要編輯的字段')` (原行 7042) → 改為 `message.warning`
- [x] 移除 `console.log('Switch changed:', checked)` (原行 8025) → 改為 TODO 註釋
- [x] 移除 `console.log('Form values:', values)` (原行 8885)

#### 2. 清理 localStorage Debug 語句 ✅ 已完成
- [x] 移除 `console.error("Error reading from localStorage...")` (原行 2808) → 改為註釋說明
- [x] 移除 `console.error("Error writing to localStorage...")` (原行 2817) → 改為註釋說明

### 📋 中優先級 (近期處理)

#### 3. 優化重複的樣式模式

##### CSS 變數統一
- [ ] 建立共用顏色變數 (142 個 rgba 白色定義)
  ```css
  --text-white-primary: rgba(255, 255, 255, 0.9)
  --text-white-secondary: rgba(255, 255, 255, 0.7)
  --text-white-tertiary: rgba(255, 255, 255, 0.5)
  --bg-overlay-light: rgba(255, 255, 255, 0.05)
  --bg-overlay-medium: rgba(255, 255, 255, 0.1)
  ```

- [ ] 建立共用間距變數 (38 個 padding: 16px, 20 個 marginBottom: 16px)
  ```css
  --spacing-sm: 8px
  --spacing-md: 16px
  --spacing-lg: 24px
  --spacing-xl: 32px
  ```

##### 漸層背景優化 (71 個 linear-gradient)
- [ ] 建立標準漸層變數
- [ ] 統一毛玻璃效果樣式
- [ ] 減少重複的 backdrop-filter 設定

#### 4. 組件樣式優化

##### Card 組件統一
- [ ] 統一所有 Card 的 height 設定 (目前有 252px 的重複)
- [ ] 標準化 Card 的 padding 和 margin
- [ ] 建立共用的 Card 樣式類別

##### 按鈕樣式統一
- [ ] 統一 toolbar-btn 樣式 (60 個實例)
- [ ] 標準化按鈕間距和大小
- [ ] 建立按鈕樣式變數

### ✅ 低優先級 (後續處理)

#### 5. 程式碼結構優化

##### 函數重構
- [ ] 檢查 8 個 handleCancel 函數是否有重複邏輯
- [ ] 優化 135 個 onClick 處理器
- [ ] 合併相似的表單處理函數

##### 變數和常數整理
- [ ] 檢查 50 個 mock 資料是否有重複
- [ ] 整理重複的圖標引用 (187 個 Outlined 圖標)
- [ ] 優化 95 個 useState hooks 的使用

#### 6. 性能優化

##### CSS 優化
- [ ] 減少 !important 用法 (檢查 245 個 .ant- 覆蓋)
- [ ] 合併相似的 CSS 規則
- [ ] 優化 CSS 選擇器效率

##### Bundle 大小優化
- [ ] 檢查未使用的 Ant Design 組件
- [ ] 優化圖標引入 (只引入使用的圖標)
- [ ] 評估程式碼分割的可能性

#### 7. 文件和註釋優化

##### 程式碼註釋
- [ ] 補充複雜邏輯的註釋
- [ ] 移除過時或無用的註釋
- [ ] 統一註釋風格

##### 變數命名
- [ ] 檢查變數命名的一致性
- [ ] 優化長函數名稱
- [ ] 統一布林變數的命名模式

## 📊 統計數據

- **總行數**: 13,215 行
- **React 組件**: 37 個
- **自定義函數**: 119 個
- **狀態變數**: 95 個
- **CSS 類別**: 472 個
- **CSS 變數**: 478 個

## 🎯 清理進度追蹤

### 已完成
- [x] 建立 TODO 清單
- [x] 識別主要冗餘模式
- [x] 優先級分類
- [x] 移除所有 debug console 語句 (6 個)
- [x] 清理 localStorage debug 語句 (2 個)

### 進行中
- [ ] 建立共用 CSS 變數
- [ ] 優化重複樣式

### 待處理
- [ ] 函數重構
- [ ] 性能優化
- [ ] 文件優化

## 💡 清理建議

1. **漸進式清理**: 不要一次清理太多，以免影響功能
2. **測試驗證**: 每次清理後都要測試相關功能
3. **版本控制**: 每個清理任務都建立獨立的 commit
4. **文檔更新**: 清理過程中同步更新相關文檔

## 🔄 重複檢查週期

- [ ] 每週檢查一次新的冗餘模式
- [ ] 每次新功能開發後檢查
- [ ] 代碼審查時特別注意冗餘問題
