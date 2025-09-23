import React from 'react'
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Radio,
  Checkbox,
  DatePicker,
  TimePicker,
  Upload,
  Rate,
  Slider,
  Button,
  Space,
  Card,
  Divider
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { FormField, FormFieldValidation } from '../../types/components'

// 表單工廠組件 Props
export interface FormFactoryProps {
  fields: FormField[]
  onSubmit: (values: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  initialValues?: Record<string, any>
  layout?: 'horizontal' | 'vertical' | 'inline'
  size?: 'small' | 'middle' | 'large'
  labelCol?: { span: number }
  wrapperCol?: { span: number }
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  validateOnChange?: boolean
  showSubmitButton?: boolean
  showCancelButton?: boolean
  submitButtonText?: string
  cancelButtonText?: string
  submitButtonProps?: any
  cancelButtonProps?: any
}

// 表單工廠組件
export const FormFactory: React.FC<FormFactoryProps> = ({
  fields,
  onSubmit,
  onCancel,
  loading = false,
  initialValues = {},
  layout = 'vertical',
  size = 'middle',
  labelCol,
  wrapperCol,
  className,
  style,
  disabled = false,
  validateOnChange = false,
  showSubmitButton = true,
  showCancelButton = true,
  submitButtonText = '提交',
  cancelButtonText = '取消',
  submitButtonProps = {},
  cancelButtonProps = {},
}) => {
  const [form] = Form.useForm()
  // 表單值變更處理
  const handleValuesChange = (_: any, __: any) => {
    if (validateOnChange) {
      form.validateFields()
    }
  }

  // 表單提交處理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit(values)
    } catch (error) {
      // 表單驗證失敗
      console.error('Form validation failed:', error)
    }
  }

  // 表單取消處理
  const handleCancel = () => {
    form.resetFields()
    onCancel?.()
  }

  // 渲染表單字段
  const renderField = (field: FormField) => {
    const {
      name,
      label,
      type,
      required = false,
      placeholder,
      options = [],
      validation,
      dependencies = [],
      props = {}
    } = field

    const fieldProps = {
      name,
      label,
      rules: [
        ...(required ? [{ required: true, message: `${label}是必填項` }] : []),
        ...(validation ? [createValidationRule(validation)] : [])
      ],
      dependencies,
      ...props
    }

    // 根據字段類型渲染對應的組件
    switch (type) {
      case 'input':
        return <Input {...fieldProps} placeholder={placeholder} disabled={disabled} />

      case 'password':
        return <Input.Password {...fieldProps} placeholder={placeholder} disabled={disabled} />

      case 'textarea':
        return <Input.TextArea {...fieldProps} placeholder={placeholder} disabled={disabled} />

      case 'select':
        return (
          <Select
            {...fieldProps}
            placeholder={placeholder}
            disabled={disabled}
            options={options}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        )

      case 'checkbox':
        return (
          <Checkbox.Group {...fieldProps} disabled={disabled} options={options} />
        )

      case 'radio':
        return (
          <Radio.Group {...fieldProps} disabled={disabled} options={options} />
        )

      case 'switch':
        return <Switch {...fieldProps} disabled={disabled} />

      case 'number':
        return (
          <InputNumber
            {...fieldProps}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        )

      case 'date':
        return (
          <DatePicker
            {...fieldProps}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        )

      case 'time':
        return (
          <TimePicker
            {...fieldProps}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        )

      case 'datetime':
        return (
          <DatePicker
            {...fieldProps}
            placeholder={placeholder}
            disabled={disabled}
            style={{ width: '100%' }}
            showTime
          />
        )

      case 'range':
        return (
          <DatePicker.RangePicker
            {...fieldProps}
            placeholder={[placeholder || '開始時間', '結束時間']}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        )

      case 'file':
        return (
          <Upload
            {...fieldProps}
            disabled={disabled}
            beforeUpload={() => false} // 阻止自動上傳
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} disabled={disabled}>
              選擇文件
            </Button>
          </Upload>
        )

      case 'rate':
        return <Rate {...fieldProps} disabled={disabled} />

      case 'slider':
        return (
          <Slider
            {...fieldProps}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        )

      default:
        return <Input {...fieldProps} placeholder={placeholder} disabled={disabled} />
    }
  }

  // 創建驗證規則
  const createValidationRule = (validation: FormFieldValidation) => {
    const rules: any[] = []

    if (validation.min !== undefined) {
      rules.push({ type: 'number', min: validation.min, message: `最小值為 ${validation.min}` })
    }

    if (validation.max !== undefined) {
      rules.push({ type: 'number', max: validation.max, message: `最大值為 ${validation.max}` })
    }

    if (validation.pattern) {
      rules.push({
        pattern: validation.pattern,
        message: validation.message || '格式不正確'
      })
    }

    if (validation.validator) {
      rules.push({
        validator: (_: any, value: any) => {
          try {
            const isValid = validation.validator!(value)
            if (isValid === false) {
              return Promise.reject(new Error(validation.message || '驗證失敗'))
            }
            return Promise.resolve()
          } catch (error) {
            return Promise.reject(new Error(validation.message || '驗證失敗'))
          }
        }
      })
    }

    return rules[0] || { required: false, message: '請檢查此字段' }
  }

  // 將字段分組
  const groupedFields = fields.reduce((acc, field) => {
    const group = field.props?.group || 'default'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(field)
    return acc
  }, {} as Record<string, FormField[]>)

  const hasGroups = Object.keys(groupedFields).length > 1

  return (
    <Form
      form={form}
      layout={layout}
      size={size}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      disabled={disabled}
      className={className}
      style={style}
    >
      {hasGroups ? (
        // 分組渲染
        Object.entries(groupedFields).map(([groupName, groupFields], index) => (
          <div key={groupName}>
            {index > 0 && <Divider />}
            <Card
              type="inner"
              title={groupName === 'default' ? undefined : groupName}
              size="small"
              style={{ marginBottom: 16 }}
            >
              {groupFields.map(field => (
                <Form.Item key={field.name}>
                  {renderField(field)}
                </Form.Item>
              ))}
            </Card>
          </div>
        ))
      ) : (
        // 普通渲染
        fields.map(field => (
          <Form.Item key={field.name}>
            {renderField(field)}
          </Form.Item>
        ))
      )}

      {/* 表單操作按鈕 */}
      {(showSubmitButton || showCancelButton) && (
        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {showCancelButton && (
              <Button
                onClick={handleCancel}
                disabled={loading}
                {...cancelButtonProps}
              >
                {cancelButtonText}
              </Button>
            )}
            {showSubmitButton && (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                {...submitButtonProps}
              >
                {submitButtonText}
              </Button>
            )}
          </Space>
        </Form.Item>
      )}
    </Form>
  )
}

// 表單構建器類
export class FormBuilder {
  private fields: FormField[] = []

  // 添加輸入框字段
  input(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'input',
      required: false,
      ...options
    })
    return this
  }

  // 添加密碼字段
  password(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'password',
      required: false,
      ...options
    })
    return this
  }

  // 添加多行文本字段
  textarea(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'textarea',
      required: false,
      ...options
    })
    return this
  }

  // 添加下拉選擇字段
  select(name: string, label: string, options: FormField['options'], config?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'select',
      options,
      required: false,
      ...config
    })
    return this
  }

  // 添加數字輸入字段
  number(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'number',
      required: false,
      ...options
    })
    return this
  }

  // 添加開關字段
  switch(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'switch',
      required: false,
      ...options
    })
    return this
  }

  // 添加日期選擇字段
  date(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'date',
      required: false,
      ...options
    })
    return this
  }

  // 添加時間選擇字段
  time(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'time',
      required: false,
      ...options
    })
    return this
  }

  // 添加日期時間選擇字段
  datetime(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'datetime',
      required: false,
      ...options
    })
    return this
  }

  // 添加日期範圍選擇字段
  range(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'range',
      required: false,
      ...options
    })
    return this
  }

  // 添加文件上傳字段
  file(name: string, label: string, options?: Partial<FormField>) {
    this.fields.push({
      name,
      label,
      type: 'file',
      required: false,
      ...options
    })
    return this
  }

  // 設置字段為必填
  required(required = true) {
    const lastField = this.fields[this.fields.length - 1]
    if (lastField) {
      lastField.required = required
    }
    return this
  }

  // 設置字段佔位符
  placeholder(placeholder: string) {
    const lastField = this.fields[this.fields.length - 1]
    if (lastField) {
      lastField.placeholder = placeholder
    }
    return this
  }

  // 設置字段驗證規則
  validation(validation: FormFieldValidation) {
    const lastField = this.fields[this.fields.length - 1]
    if (lastField) {
      lastField.validation = validation
    }
    return this
  }

  // 設置字段依賴
  dependsOn(dependencies: string[]) {
    const lastField = this.fields[this.fields.length - 1]
    if (lastField) {
      lastField.dependencies = dependencies
    }
    return this
  }

  // 設置字段額外屬性
  props(props: Record<string, any>) {
    const lastField = this.fields[this.fields.length - 1]
    if (lastField) {
      lastField.props = { ...lastField.props, ...props }
    }
    return this
  }

  // 構建表單字段數組
  build() {
    return this.fields
  }
}

// 預定義的常用表單模板
export const FormTemplates = {
  // 用戶信息表單
  userInfo: () => new FormBuilder()
    .input('username', '用戶名').required().placeholder('請輸入用戶名').build()
    .concat(new FormBuilder()
      .input('email', '電子郵件').required().placeholder('請輸入電子郵件')
      .validation({ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的電子郵件地址' })
      .build()
    )
    .concat(new FormBuilder()
      .input('displayName', '顯示名稱').required().placeholder('請輸入顯示名稱').build()
    )
    .concat(new FormBuilder()
      .select('role', '角色', [
        { label: '管理員', value: 'admin' },
        { label: '用戶', value: 'user' },
        { label: '訪客', value: 'guest' }
      ]).build()
    ),

  // 資源配置表單
  resourceConfig: () => new FormBuilder()
    .input('name', '資源名稱').required().placeholder('請輸入資源名稱').build()
    .concat(new FormBuilder()
      .select('type', '資源類型', [
        { label: '伺服器', value: 'server' },
        { label: '資料庫', value: 'database' },
        { label: '快取', value: 'cache' },
        { label: '網關', value: 'gateway' },
        { label: '服務', value: 'service' }
      ]).required().build()
    )
    .concat(new FormBuilder()
      .input('host', '主機地址').placeholder('例如: 192.168.1.100').build()
    )
    .concat(new FormBuilder()
      .number('port', '埠號').placeholder('請輸入埠號').build()
    )
    .concat(new FormBuilder()
      .switch('enabled', '啟用狀態').build()
    ),

  // 通知配置表單
  notificationConfig: () => new FormBuilder()
    .input('name', '策略名稱').required().placeholder('請輸入策略名稱').build()
    .concat(new FormBuilder()
      .select('channels', '通知管道', [
        { label: '電子郵件', value: 'email' },
        { label: 'Slack', value: 'slack' },
        { label: 'Webhook', value: 'webhook' },
        { label: '簡訊', value: 'sms' }
      ]).required().build()
    )
    .concat(new FormBuilder()
      .switch('enabled', '啟用狀態').build()
    ),
}

// 導出工具函數 (已在上面定義)
