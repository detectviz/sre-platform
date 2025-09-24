import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormLayout } from '../FormLayout'
import { Button, Form, Input } from 'antd'

describe('FormLayout', () => {
  const mockFormActions = [
    <Button key="submit" type="primary">提交</Button>,
    <Button key="cancel">取消</Button>,
    <Button key="reset">重置</Button>,
  ]

  const mockForm = (
    <Form layout="vertical">
      <Form.Item label="名稱" name="name" rules={[{ required: true, message: '請輸入名稱' }]}>
        <Input placeholder="請輸入名稱" />
      </Form.Item>
      <Form.Item label="描述" name="description">
        <Input.TextArea placeholder="請輸入描述" />
      </Form.Item>
      <Form.Item label="狀態" name="status">
        <Input placeholder="請輸入狀態" />
      </Form.Item>
    </Form>
  )

  const defaultProps = {
    header: <div>表單標題</div>,
    content: mockForm,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header and form content correctly', () => {
    render(<FormLayout {...defaultProps} />)

    expect(screen.getByText('表單標題')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('請輸入名稱')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('請輸入描述')).toBeInTheDocument()
  })

  it('renders form actions when provided', () => {
    render(
      <FormLayout
        {...defaultProps}
        config={{
          actions: mockFormActions,
          actionsPosition: 'bottom',
        }}
      />
    )

    expect(screen.getByText('提交')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
    expect(screen.getByText('重置')).toBeInTheDocument()
  })

  it('applies form container styling correctly', () => {
    render(
      <FormLayout
        {...defaultProps}
        config={{
          formContainer: {
            size: 'large',
            bordered: true,
          },
        }}
      />
    )

    // 檢查是否有表單容器樣式
    const formContainer = screen.getByText('表單標題').closest('.form-container')
    expect(formContainer).toBeInTheDocument()
  })

  it('handles form submission', () => {
    const onSubmit = jest.fn()

    const { container } = render(
      <FormLayout
        {...defaultProps}
        config={{
          actions: [
            <Button key="submit" type="primary" onClick={onSubmit}>
              提交
            </Button>,
          ],
        }}
      />
    )

    const submitButton = screen.getByText('提交')
    fireEvent.click(submitButton)

    expect(onSubmit).toHaveBeenCalled()
  })

  it('renders with sidebar when provided', () => {
    const sidebar = <div>表單說明</div>

    render(
      <FormLayout
        {...defaultProps}
        sidebar={sidebar}
      />
    )

    expect(screen.getByText('表單說明')).toBeInTheDocument()
  })

  it('applies custom className and style', () => {
    const customClass = 'custom-form-layout'
    const customStyle = { backgroundColor: 'lightgray' }

    const { container } = render(
      <FormLayout
        {...defaultProps}
        className={customClass}
        style={customStyle}
      />
    )

    const layoutElement = container.firstChild as HTMLElement
    expect(layoutElement).toHaveClass(customClass)
    expect(layoutElement).toHaveStyle(customStyle)
  })

  it('handles different actions positions', () => {
    const { rerender } = render(
      <FormLayout
        {...defaultProps}
        config={{
          actions: mockFormActions,
          actionsPosition: 'top',
        }}
      />
    )

    // 檢查動作按鈕是否在頂部
    const submitButton = screen.getByText('提交')
    expect(submitButton).toBeInTheDocument()

    // 重新渲染到底部
    rerender(
      <FormLayout
        {...defaultProps}
        config={{
          actions: mockFormActions,
          actionsPosition: 'bottom',
        }}
      />
    )
  })

  it('handles form validation', () => {
    render(
      <FormLayout
        {...defaultProps}
        config={{
          actions: mockFormActions,
        }}
      />
    )

    const nameInput = screen.getByPlaceholderText('請輸入名稱')
    fireEvent.change(nameInput, { target: { value: 'test' } })

    expect(nameInput).toHaveValue('test')
  })

  it('renders with KPI cards when provided', () => {
    const mockKpiCards = [
      {
        title: '表單統計',
        value: '50',
        change: '+5',
        changeType: 'increase' as const,
      },
    ]

    render(
      <FormLayout
        {...defaultProps}
        config={{
          showKpiCards: true,
          kpiCards: mockKpiCards,
        }}
      />
    )

    expect(screen.getByText('表單統計')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('handles empty config gracefully', () => {
    render(<FormLayout {...defaultProps} config={{}} />)

    expect(screen.getByText('表單標題')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('請輸入名稱')).toBeInTheDocument()
  })

  it('handles undefined config gracefully', () => {
    render(<FormLayout {...defaultProps} config={undefined} />)

    expect(screen.getByText('表單標題')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('請輸入名稱')).toBeInTheDocument()
  })

  it('applies responsive layout', () => {
    const { container } = render(
      <FormLayout
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

  it('handles custom form container configuration', () => {
    render(
      <FormLayout
        {...defaultProps}
        config={{
          formContainer: {
            size: 'small',
            bordered: true,
            title: '自定義表單',
            extra: <div>額外內容</div>,
          },
        }}
      />
    )

    expect(screen.getByText('額外內容')).toBeInTheDocument()
  })

  it('renders with tabs when provided', () => {
    const mockTabs = [
      { key: 'tab1', label: '基本信息', children: <div>基本信息內容</div> },
      { key: 'tab2', label: '高級設置', children: <div>高級設置內容</div> },
    ]

    render(
      <FormLayout
        {...defaultProps}
        config={{
          showTabs: true,
          tabs: mockTabs,
        }}
      />
    )

    expect(screen.getByText('基本信息')).toBeInTheDocument()
    expect(screen.getByText('高級設置')).toBeInTheDocument()
  })

  it('handles different spacing configurations', () => {
    const { container } = render(
      <FormLayout
        {...defaultProps}
        config={{
          spacing: {
            header: '24px',
            content: '20px',
            sidebar: '16px',
          },
        }}
      />
    )

    const headerElement = container.querySelector('.layout-header')
    const contentElement = container.querySelector('.layout-content')

    expect(headerElement).toHaveStyle({ padding: '24px' })
    expect(contentElement).toHaveStyle({ padding: '20px' })
  })
})
