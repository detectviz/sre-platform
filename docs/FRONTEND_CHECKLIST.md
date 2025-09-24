# 前端開發檢查清單

> SRE 平台前端開發品質保證與最佳實踐指南

## 📋 開發流程檢查

### 🚀 開發前準備
- [ ] 確認功能需求和設計稿完整性
- [ ] 檢查相關 API 接口文檔和類型定義
- [ ] 確認 UI/UX 設計符合平台設計系統
- [ ] 評估功能複雜度和工期安排

### 💻 開發中檢查
- [ ] 遵循現有代碼風格和命名規範
- [ ] 使用統一的組件庫和設計語言
- [ ] 確保新組件可複用性和可測試性
- [ ] 及時提交代碼並撰寫清晰的 commit 訊息

### 🔍 開發後檢查
- [ ] 代碼自審查和功能測試
- [ ] 確保無 TypeScript 編譯錯誤
- [ ] 運行 ESLint 和 Prettier 代碼格式化
- [ ] 更新相關文檔和註釋

## 🏗️ 架構設計檢查清單

### ✅ 組件設計原則
- [ ] **單一職責**：每個組件只負責一個明確的功能
- [ ] **組合優於繼承**：使用組合模式而非複雜的繼承關係
- [ ] **Props 接口設計**：清晰的 Props 類型定義和預設值
- [ ] **狀態管理**：合理的 local state vs global state 分配
- [ ] **副作用處理**：正確使用 useEffect 和清理函數

### 📁 檔案組織規範
- [ ] **命名一致性**：遵循 PascalCase（組件）和 camelCase（函數）
- [ ] **目錄結構**：按功能模組組織，避免過深的嵌套
- [ ] **匯入順序**：React → 第三方庫 → 內部組件 → 類型 → 樣式
- [ ] **檔案大小**：單檔案不超過 500 行，複雜組件考慮拆分

```typescript
// ✅ 推薦的匯入順序
import React, { useState, useEffect } from 'react'
import { Button, Card, Space } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import { PageLayout } from '../components'
import { UserService } from '../services'
import type { User, ApiResponse } from '../types'
import './UserPage.css'
```

### 🔄 狀態管理檢查
- [ ] **局部狀態優先**：優先使用 useState 處理組件內部狀態
- [ ] **提升狀態時機**：僅在多個組件需要共享時提升到上層
- [ ] **不可變更新**：使用展開運算符或 Immer 更新狀態
- [ ] **副作用清理**：及時清理事件監聽器、訂閱和計時器

## 📝 代碼品質檢查清單

### 🔧 TypeScript 最佳實踐
- [ ] **嚴格類型**：啟用嚴格模式，避免 `any` 類型
- [ ] **接口定義**：為所有 Props、State、API 響應定義接口
- [ ] **類型推導**：合理利用 TypeScript 類型推導能力
- [ ] **泛型使用**：在通用組件中使用泛型提高複用性

```typescript
// ✅ 優秀的類型定義示例
interface DataTableProps<T = any> {
  data: T[]
  columns: ColumnConfig<T>[]
  loading?: boolean
  onRowSelect?: (record: T, index: number) => void
  pagination?: PaginationConfig
}

// ✅ 使用泛型的通用組件
const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowSelect,
  pagination
}: DataTableProps<T>) => {
  // 組件實現
}
```

### 🎯 性能優化檢查
- [ ] **記憶化組件**：使用 `React.memo` 避免不必要的重渲染
- [ ] **回調函數優化**：使用 `useCallback` 緩存回調函數
- [ ] **計算屬性緩存**：使用 `useMemo` 緩存複雜計算
- [ ] **懶加載實現**：使用 `React.lazy` 進行路由級別的代碼分割
- [ ] **虛擬列表**：大數據列表使用虛擬滾動技術

```typescript
// ✅ 性能優化範例
const UserList = React.memo(({ users, onUserClick }: UserListProps) => {
  const handleUserClick = useCallback((user: User) => {
    onUserClick?.(user)
  }, [onUserClick])

  const filteredUsers = useMemo(() => {
    return users.filter(user => user.status === 'active')
  }, [users])

  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={handleUserClick}
        />
      ))}
    </div>
  )
})
```

### 🔒 安全性檢查
- [ ] **XSS 防護**：避免直接使用 `dangerouslySetInnerHTML`
- [ ] **輸入驗證**：所有用戶輸入進行前端驗證
- [ ] **敏感數據**：不在前端存儲敏感信息（密碼、令牌等）
- [ ] **HTTPS 使用**：確保所有 API 請求使用 HTTPS
- [ ] **依賴安全**：定期檢查第三方依賴的安全漏洞

## 🎨 UI/UX 檢查清單

### 🎭 設計系統一致性
- [ ] **色彩規範**：使用平台定義的色彩變數
- [ ] **字體系統**：遵循統一的字體大小和行高標準
- [ ] **間距系統**：使用預定義的間距值（8px 基準）
- [ ] **圖標使用**：使用 Ant Design Icons 或平台自定義圖標庫
- [ ] **組件複用**：優先使用已有組件，避免重複開發

```css
/* ✅ 使用 CSS 變數維護設計系統 */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;

  --font-size-small: 12px;
  --font-size-base: 14px;
  --font-size-large: 16px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 📱 響應式設計
- [ ] **斷點使用**：使用 Ant Design 預定義斷點
- [ ] **彈性佈局**：使用 Flexbox 或 Grid 實現響應式佈局
- [ ] **行動優先**：考慮移動端的用戶體驗
- [ ] **觸控友好**：確保按鈕和可點擊區域大小適中（至少 44px）

### 🔄 載入與狀態
- [ ] **載入狀態**：所有異步操作提供載入指示器
- [ ] **空狀態**：提供有意義的空狀態頁面和操作引導
- [ ] **錯誤狀態**：友好的錯誤信息和恢復建議
- [ ] **成功回饋**：操作成功後的明確回饋信息
- [ ] **防止重複提交**：表單提交後禁用提交按鈕

```typescript
// ✅ 完善的狀態管理範例
const UserForm = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: UserFormData) => {
    setLoading(true)
    setError(null)

    try {
      await UserService.create(values)
      message.success('用戶創建成功！')
      // 處理成功邏輯
    } catch (err) {
      setError(err.message || '創建用戶失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form onFinish={handleSubmit}>
      {error && <Alert message={error} type="error" closable />}
      {/* 表單內容 */}
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        disabled={loading}
      >
        {loading ? '創建中...' : '創建用戶'}
      </Button>
    </Form>
  )
}
```

## 🧪 測試檢查清單

### 🔬 單元測試
- [ ] **組件測試**：關鍵組件的渲染和交互測試
- [ ] **工具函數測試**：所有 utility 函數的測試覆蓋
- [ ] **Hooks 測試**：自定義 Hooks 的功能測試
- [ ] **邊界條件**：測試異常輸入和邊界情況
- [ ] **模擬依賴**：正確模擬外部依賴（API、localStorage 等）

```typescript
// ✅ 組件測試範例
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserForm } from './UserForm'

describe('UserForm', () => {
  it('should render form fields correctly', () => {
    render(<UserForm />)

    expect(screen.getByLabelText('用戶名')).toBeInTheDocument()
    expect(screen.getByLabelText('郵箱')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument()
  })

  it('should show validation error for invalid email', async () => {
    render(<UserForm />)

    const emailInput = screen.getByLabelText('郵箱')
    const submitButton = screen.getByRole('button', { name: '提交' })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('請輸入有效的郵箱地址')).toBeInTheDocument()
    })
  })
})
```

### 🎭 E2E 測試
- [ ] **關鍵路徑**：覆蓋主要用戶操作流程
- [ ] **跨瀏覽器**：在主流瀏覽器中測試兼容性
- [ ] **回歸測試**：確保新功能不破壞現有功能
- [ ] **性能測試**：監控頁面載入和交互性能

## ⚡ 性能優化檢查清單

### 📦 打包優化
- [ ] **代碼分割**：使用動態 import 進行路由級別分割
- [ ] **Tree Shaking**：確保打包工具能正確移除未使用代碼
- [ ] **依賴分析**：定期分析打包大小並優化大型依賴
- [ ] **CDN 使用**：靜態資源使用 CDN 加速
- [ ] **緩存策略**：合理配置瀏覽器和服務器緩存

### 🚀 運行時優化
- [ ] **圖片優化**：使用適當格式和大小的圖片
- [ ] **懶加載**：圖片和非關鍵內容的懶加載
- [ ] **防抖節流**：搜索和滾動事件的防抖處理
- [ ] **虛擬滾動**：長列表使用虛擬滾動技術
- [ ] **Web Workers**：CPU 密集型任務使用 Web Workers

```typescript
// ✅ 搜索防抖範例
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 執行搜索
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <Input
      placeholder="搜索用戶..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
```

## 🔧 工具配置檢查清單

### 🛠️ 開發工具
- [ ] **TypeScript 配置**：嚴格模式和路徑映射
- [ ] **ESLint 規則**：代碼品質和風格檢查
- [ ] **Prettier 配置**：統一的代碼格式化
- [ ] **Husky Git Hooks**：提交前的代碼檢查
- [ ] **VS Code 插件**：推薦的開發插件配置

### 📊 監控工具
- [ ] **錯誤監控**：Sentry 或類似工具的錯誤收集
- [ ] **性能監控**：Core Web Vitals 指標追蹤
- [ ] **用戶行為**：關鍵功能的使用統計
- [ ] **構建分析**：Bundle Analyzer 的定期檢查

## 📚 文檔檢查清單

### 📖 代碼文檔
- [ ] **組件文檔**：主要組件的 JSDoc 註釋
- [ ] **Props 說明**：複雜 Props 的使用說明
- [ ] **使用範例**：組件的使用範例和最佳實踐
- [ ] **API 文檔**：與後端接口的文檔同步

### 📝 項目文檔
- [ ] **README 更新**：項目介紹和快速開始指南
- [ ] **CHANGELOG**：版本變更記錄
- [ ] **部署指南**：生產環境部署步驟
- [ ] **貢獻指南**：新開發者的上手指南

## ✅ 發佈前檢查清單

### 🔍 最終檢查
- [ ] **功能測試**：所有功能在不同瀏覽器中正常工作
- [ ] **性能檢查**：Lighthouse 分數達到預期標準
- [ ] **無障礙測試**：基本的 a11y 標準符合性
- [ ] **SEO 檢查**：meta 標籤和結構化數據
- [ ] **安全掃描**：依賴項安全漏洞掃描

### 📦 部署準備
- [ ] **環境變數**：生產環境配置正確
- [ ] **構建測試**：生產構建無錯誤
- [ ] **回滾方案**：準備回滾策略和腳本
- [ ] **監控設置**：錯誤和性能監控已配置

## 📊 品質指標

### 🎯 目標指標
| 指標類別 | 目標值 | 檢查頻率 |
|---------|--------|----------|
| TypeScript 覆蓋率 | > 95% | 每次 PR |
| 測試覆蓋率 | > 80% | 每週 |
| Lighthouse 性能 | > 90 | 每次發佈 |
| 構建大小 | < 2MB (gzipped) | 每次發佈 |
| 首屏載入時間 | < 3s | 每次發佈 |

### 📈 持續改進
- [ ] **定期 Code Review**：同事間的代碼審查
- [ ] **技術分享**：新技術和最佳實踐的分享
- [ ] **重構計劃**：技術債務的定期清理
- [ ] **性能優化**：定期的性能分析和優化
- [ ] **用戶回饋**：收集和分析用戶使用回饋

---

## 🏷️ 檢查清單使用指南

### 📋 如何使用
1. **每日開發**：參考「開發流程檢查」和「代碼品質檢查」
2. **功能完成**：執行「UI/UX 檢查」和「測試檢查」
3. **發佈準備**：完整執行「發佈前檢查清單」
4. **定期維護**：按照「品質指標」進行定期檢查

### 🎖️ 最佳實踐
- **逐步實施**：不要一次性要求所有項目，循序漸進
- **團隊共識**：確保所有團隊成員理解並同意這些標準
- **工具輔助**：使用自動化工具減少人工檢查負擔
- **持續更新**：根據項目發展和技術變化更新檢查清單

---

*此檢查清單應根據項目實際情況進行調整，建議每季度回顧和更新一次。*