import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TableLayout } from '../TableLayout'
import { ToolbarActions } from '../../ToolbarActions'

describe('TableLayout', () => {
  const mockToolbarActions = [
    {
      key: 'create',
      label: '新增',
      icon: <div>+</div>,
      type: 'primary' as const,
      onClick: jest.fn(),
    },
    {
      key: 'refresh',
      label: '刷新',
      icon: <div>↻</div>,
      onClick: jest.fn(),
    },
  ]

  const mockFilters = [
    {
      key: 'status',
      label: '狀態',
      options: [
        { value: 'active', label: '活躍' },
        { value: 'inactive', label: '停用' },
      ],
    },
  ]

  const defaultProps = {
    header: <div>表格標題</div>,
    content: <div>表格內容</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header and content correctly', () => {
    render(<TableLayout {...defaultProps} />)

    expect(screen.getByText('表格標題')).toBeInTheDocument()
    expect(screen.getByText('表格內容')).toBeInTheDocument()
  })

  it('renders toolbar when provided', () => {
    render(
      <TableLayout
        {...defaultProps}
        config={{
          toolbar: (
            <ToolbarActions
              actions={mockToolbarActions}
              filters={mockFilters}
              searchPlaceholder="搜尋..."
              showSearch={true}
            />
          ),
        }}
      />
    )

    expect(screen.getByText('新增')).toBeInTheDocument()
    expect(screen.getByText('刷新')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('搜尋...')).toBeInTheDocument()
  })

  it('renders tabs when showTabs is true', () => {
    const mockTabs = [
      { key: 'tab1', label: '標籤1', children: <div>標籤1內容</div> },
      { key: 'tab2', label: '標籤2', children: <div>標籤2內容</div> },
    ]

    render(
      <TableLayout
        {...defaultProps}
        config={{
          showTabs: true,
          tabs: mockTabs,
        }}
      />
    )

    expect(screen.getByText('標籤1')).toBeInTheDocument()
    expect(screen.getByText('標籤2')).toBeInTheDocument()
  })

  it('renders KPI cards when provided', () => {
    const mockKpiCards = [
      {
        title: '總計',
        value: '100',
        change: '+10',
        changeType: 'increase' as const,
      },
    ]

    render(
      <TableLayout
        {...defaultProps}
        config={{
          showKpiCards: true,
          kpiCards: mockKpiCards,
        }}
      />
    )

    expect(screen.getByText('總計')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('handles toolbar actions click', () => {
    render(
      <TableLayout
        {...defaultProps}
        config={{
          toolbar: (
            <ToolbarActions
              actions={mockToolbarActions}
              filters={mockFilters}
              searchPlaceholder="搜尋..."
              showSearch={true}
            />
          ),
        }}
      />
    )

    const createButton = screen.getByText('新增')
    fireEvent.click(createButton)

    expect(mockToolbarActions[0].onClick).toHaveBeenCalled()
  })

  it('applies custom table container styles', () => {
    const { container } = render(
      <TableLayout
        {...defaultProps}
        config={{
          tableContainer: {
            bordered: true,
            size: 'small',
            scroll: { x: 1000 },
          },
        }}
      />
    )

    const tableElement = container.querySelector('.table-container')
    expect(tableElement).toBeInTheDocument()
  })

  it('handles search functionality', () => {
    render(
      <TableLayout
        {...defaultProps}
        config={{
          toolbar: (
            <ToolbarActions
              actions={mockToolbarActions}
              filters={mockFilters}
              searchPlaceholder="搜尋..."
              showSearch={true}
            />
          ),
        }}
      />
    )

    const searchInput = screen.getByPlaceholderText('搜尋...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    expect(searchInput).toHaveValue('test')
  })

  it('renders filter dropdown options', () => {
    render(
      <TableLayout
        {...defaultProps}
        config={{
          toolbar: (
            <ToolbarActions
              actions={mockToolbarActions}
              filters={mockFilters}
              searchPlaceholder="搜尋..."
              showSearch={true}
            />
          ),
        }}
      />
    )

    // 檢查篩選器是否存在
    expect(screen.getByText('狀態')).toBeInTheDocument()
  })

  it('applies custom className and style', () => {
    const customClass = 'custom-table-layout'
    const customStyle = { backgroundColor: 'white' }

    const { container } = render(
      <TableLayout
        {...defaultProps}
        className={customClass}
        style={customStyle}
      />
    )

    const layoutElement = container.firstChild as HTMLElement
    expect(layoutElement).toHaveClass(customClass)
    expect(layoutElement).toHaveStyle(customStyle)
  })

  it('handles empty config gracefully', () => {
    render(<TableLayout {...defaultProps} config={{}} />)

    expect(screen.getByText('表格標題')).toBeInTheDocument()
    expect(screen.getByText('表格內容')).toBeInTheDocument()
  })

  it('handles undefined config gracefully', () => {
    render(<TableLayout {...defaultProps} config={undefined} />)

    expect(screen.getByText('表格標題')).toBeInTheDocument()
    expect(screen.getByText('表格內容')).toBeInTheDocument()
  })

  it('renders with sidebar when provided', () => {
    const sidebar = <div>表格側邊欄</div>

    render(
      <TableLayout
        {...defaultProps}
        sidebar={sidebar}
      />
    )

    expect(screen.getByText('表格側邊欄')).toBeInTheDocument()
  })

  it('handles responsive layout', () => {
    const { container } = render(
      <TableLayout
        {...defaultProps}
        config={{
          sidebar: {
            show: true,
            responsive: true,
          },
        }}
      />
    )

    const layoutElement = container.firstChild as HTMLElement
    expect(layoutElement).toHaveClass('responsive')
  })
})
