import React from 'react'
import { render, screen } from '@testing-library/react'
import { BaseLayout } from '../BaseLayout'

// 模擬載入和錯誤組件
const LoadingSkeleton = () => <div data-testid="loading">Loading...</div>
const ErrorFallback = ({ error }: { error: Error }) => <div data-testid="error">{error.message}</div>

describe('BaseLayout', () => {
  const defaultProps = {
    header: <div>Header Content</div>,
    content: <div>Main Content</div>,
  }

  beforeAll(() => {
    // Mock 載入和錯誤組件
    jest.mock('../BaseLayout', () => ({
      ...jest.requireActual('../BaseLayout'),
      LayoutLoadingSkeleton: LoadingSkeleton,
      LayoutErrorFallback: ErrorFallback,
    }))
  })

  it('renders header and content correctly', () => {
    render(<BaseLayout {...defaultProps} />)

    expect(screen.getByText('Header Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('renders sidebar when provided', () => {
    const sidebar = <div>Sidebar Content</div>
    render(<BaseLayout {...defaultProps} sidebar={sidebar} />)

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
  })

  it('applies custom className and style', () => {
    const customClass = 'custom-layout'
    const customStyle = { backgroundColor: 'red' }

    const { container } = render(
      <BaseLayout
        {...defaultProps}
        className={customClass}
        style={customStyle}
      />
    )

    const layoutElement = container.firstChild as HTMLElement
    expect(layoutElement).toHaveClass(customClass)
    expect(layoutElement).toHaveStyle(customStyle)
  })

  it('handles loading state correctly', () => {
    const loadingProps = {
      ...defaultProps,
      config: { loading: true }
    }

    render(<BaseLayout {...loadingProps} />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('handles error state correctly', () => {
    const error = new Error('Test error')
    const errorProps = {
      ...defaultProps,
      config: { error }
    }

    render(<BaseLayout {...errorProps} />)

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByText(error.message)).toBeInTheDocument()
  })

  it('renders sidebar on the correct position', () => {
    const sidebar = <div>Left Sidebar</div>
    const sidebarProps = {
      ...defaultProps,
      sidebar,
      config: {
        sidebar: {
          position: 'left' as const,
          show: true,
          width: 300
        }
      }
    }

    const { container } = render(<BaseLayout {...sidebarProps} />)

    // 檢查是否有側邊欄容器
    const sidebarContainer = container.querySelector('[data-testid="sidebar-container"]')
    expect(sidebarContainer).toBeInTheDocument()
  })

  it('hides sidebar when show is false', () => {
    const sidebar = <div>Hidden Sidebar</div>
    const sidebarProps = {
      ...defaultProps,
      sidebar,
      config: {
        sidebar: {
          show: false,
          width: 300
        }
      }
    }

    const { container } = render(<BaseLayout {...sidebarProps} />)

    // 應該沒有側邊欄容器
    const sidebarContainer = container.querySelector('[data-testid="sidebar-container"]')
    expect(sidebarContainer).toBeNull()
  })

  it('applies responsive classes correctly', () => {
    const responsiveProps = {
      ...defaultProps,
      config: {
        sidebar: {
          show: true,
          responsive: true
        }
      }
    }

    const { container } = render(<BaseLayout {...responsiveProps} />)

    // 檢查是否有響應式類名
    const layoutElement = container.firstChild as HTMLElement
    expect(layoutElement).toHaveClass('responsive-layout')
  })

  it('applies spacing configuration correctly', () => {
    const spacingProps = {
      ...defaultProps,
      config: {
        spacing: {
          header: '20px',
          content: '16px',
          sidebar: '12px'
        }
      }
    }

    const { container } = render(<BaseLayout {...spacingProps} />)

    // 檢查間距樣式是否應用
    const contentElement = container.querySelector('.layout-content')
    expect(contentElement).toHaveStyle({ padding: '16px' })
  })

  it('handles empty config gracefully', () => {
    render(<BaseLayout {...defaultProps} config={{}} />)

    expect(screen.getByText('Header Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('handles undefined config gracefully', () => {
    render(<BaseLayout {...defaultProps} config={undefined} />)

    expect(screen.getByText('Header Content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })
})
