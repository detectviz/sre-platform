import React, { useState } from 'react'
import { useTabs } from '../hooks'
import { Space, Tabs, Table, Card, Button, Modal, Form, Input, Select, Switch, Badge, Progress, Alert, Tooltip } from 'antd'
import { PageHeader } from '../components/PageHeader'
import { ContextualKPICard } from '../components/ContextualKPICard'
import { ToolbarActions } from '../components/ToolbarActions'
import {
  CodeOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'


const AutomationPage: React.FC = () => {
  const { activeTab, handleTabChange } = useTabs('scripts', {
    scripts: '/automation/scripts',
    schedules: '/automation/schedules',
    logs: '/automation/logs',
  })

  // 狀態管理
  const [isScriptModalVisible, setIsScriptModalVisible] = useState(false)
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false)
  const [isLogDetailModalVisible, setIsLogDetailModalVisible] = useState(false)
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)

  // 工具列處理
  const handleRefresh = () => {
    console.log('刷新自動化數據')
  }

  const handleSearch = () => {
    console.log('打開搜索篩選')
  }

  const handleExport = () => {
    console.log('導出自動化報告')
  }

  // 腳本數據
  const scriptData = [
    {
      id: '1',
      name: 'Web 服務器健康檢查',
      type: 'shell',
      description: '自動檢查 Web 服務器狀態並發送告警',
      version: 'v1.2',
      tags: ['監控', '健康檢查'],
      lastExecution: '2025-09-23 14:30:00',
      status: 'success',
      executionCount: 245
    },
    {
      id: '2',
      name: '資料庫備份',
      type: 'python',
      description: '自動執行資料庫備份並上傳到雲端',
      version: 'v2.1',
      tags: ['備份', '資料庫'],
      lastExecution: '2025-09-23 13:15:00',
      status: 'success',
      executionCount: 89
    },
    {
      id: '3',
      name: '日誌輪轉',
      type: 'shell',
      description: '清理舊日誌文件並壓縮',
      version: 'v1.0',
      tags: ['日誌', '維護'],
      lastExecution: '2025-09-23 12:00:00',
      status: 'failed',
      executionCount: 12
    },
  ]

  const scriptColumns: ColumnsType<typeof scriptData[0]> = [
    { title: '腳本名稱', dataIndex: 'name', key: 'name', sorter: true },
    {
      title: '類型', dataIndex: 'type', key: 'type', render: (type) => (
        <Badge
          status={type === 'shell' ? 'processing' : type === 'python' ? 'success' : 'default'}
          text={type}
        />
      )
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '版本', dataIndex: 'version', key: 'version' },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => tags.map((tag: string) => (
        <Badge key={tag} size="small" style={{ marginRight: '4px' }}>
          {tag}
        </Badge>
      ))
    },
    {
      title: '最後執行',
      dataIndex: 'lastExecution',
      key: 'lastExecution',
      render: (time) => new Date(time).toLocaleString('zh-TW')
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'success' ? 'success' : 'error'}
          text={status === 'success' ? '成功' : '失敗'}
        />
      )
    },
    {
      title: '執行次數',
      dataIndex: 'executionCount',
      key: 'executionCount',
      sorter: (a, b) => a.executionCount - b.executionCount
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="執行腳本">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('執行腳本', record.name)}
            />
          </Tooltip>
          <Tooltip title="編輯腳本">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedScript(record.id)
                setIsScriptModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="刪除腳本">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => console.log('刪除腳本', record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 排程數據
  const scheduleData = [
    {
      id: '1',
      name: '每日健康檢查',
      script: 'Web 服務器健康檢查',
      type: 'recurring',
      cron: '0 2 * * *',
      nextRun: '2025-09-24 02:00:00',
      status: 'enabled',
      successRate: 95.5
    },
    {
      id: '2',
      name: '週末備份',
      script: '資料庫備份',
      type: 'recurring',
      cron: '0 1 * * 6',
      nextRun: '2025-09-28 01:00:00',
      status: 'enabled',
      successRate: 98.2
    },
    {
      id: '3',
      name: '緊急重啟',
      script: 'Web 服務器健康檢查',
      type: 'one_time',
      cron: null,
      nextRun: '2025-09-23 16:00:00',
      status: 'running',
      successRate: 0
    },
  ]

  const scheduleColumns: ColumnsType<typeof scheduleData[0]> = [
    { title: '排程名稱', dataIndex: 'name', key: 'name', sorter: true },
    { title: '關聯腳本', dataIndex: 'script', key: 'script' },
    {
      title: '類型', dataIndex: 'type', key: 'type', render: (type) => (
        <Badge
          status={type === 'recurring' ? 'processing' : 'default'}
          text={type === 'recurring' ? '週期性' : '單次'}
        />
      )
    },
    { title: 'Cron 表達式', dataIndex: 'cron', key: 'cron' },
    {
      title: '下次執行',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (time) => time ? new Date(time).toLocaleString('zh-TW') : '無'
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'enabled' ? 'success' : status === 'running' ? 'processing' : 'default'}
          text={status === 'enabled' ? '啟用' : status === 'running' ? '執行中' : '停用'}
        />
      )
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => (
        <div>
          <Progress percent={rate} size="small" status={rate < 90 ? 'exception' : 'normal'} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rate}%</span>
        </div>
      ),
      sorter: (a, b) => a.successRate - b.successRate
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="編輯排程">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedSchedule(record.id)
                setIsScheduleModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="刪除排程">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => console.log('刪除排程', record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 執行日誌數據
  const logData = [
    {
      id: '1',
      script: 'Web 服務器健康檢查',
      trigger: 'schedule',
      startTime: '2025-09-23 14:30:00',
      duration: 1200,
      status: 'success',
      output: '檢查完成，所有服務正常運行'
    },
    {
      id: '2',
      script: '資料庫備份',
      trigger: 'manual',
      startTime: '2025-09-23 13:15:00',
      duration: 4500,
      status: 'success',
      output: '備份完成，上傳到 S3 成功'
    },
    {
      id: '3',
      script: '日誌輪轉',
      trigger: 'schedule',
      startTime: '2025-09-23 12:00:00',
      duration: 300,
      status: 'failed',
      output: '磁碟空間不足，清理失敗'
    },
  ]

  const logColumns: ColumnsType<typeof logData[0]> = [
    { title: '腳本名稱', dataIndex: 'script', key: 'script', sorter: true },
    {
      title: '觸發方式',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger) => (
        <Badge
          status={
            trigger === 'schedule' ? 'processing' :
              trigger === 'manual' ? 'success' :
                'default'
          }
          text={trigger === 'schedule' ? '排程' : trigger === 'manual' ? '手動' : '事件'}
        />
      )
    },
    {
      title: '開始時間',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => new Date(time).toLocaleString('zh-TW')
    },
    {
      title: '耗時',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${Math.floor(duration / 1000)}s`,
      sorter: (a, b) => a.duration - b.duration
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'success' ? 'success' : 'error'}
          text={status === 'success' ? '成功' : '失敗'}
        />
      )
    },
    {
      title: '輸出',
      dataIndex: 'output',
      key: 'output',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Tooltip title="查看詳情">
          <Button
            type="text"
            size="small"
            onClick={() => {
              setIsLogDetailModalVisible(true)
            }}
          >
            查看詳情
          </Button>
        </Tooltip>
      ),
    },
  ]

  const kpiData = [
    {
      title: '腳本總數',
      value: '47',
      description: '包含自動化腳本和工具',
      trend: '+3',
      status: 'info' as const,
    },
    {
      title: '執行成功率',
      value: '94.2%',
      description: '本月自動化執行成功率',
      trend: '+2.1%',
      status: 'success' as const,
    },
    {
      title: '活躍排程',
      value: '12',
      description: '當前運行的自動化任務',
      trend: 'stable',
      status: 'info' as const,
    },
    {
      title: '執行日誌',
      value: '1,247',
      description: '今日自動化執行記錄',
      trend: '+15.3%',
      status: 'info' as const,
    },
  ]

  const tabItems = [
    {
      key: 'scripts',
      label: '腳本庫',
      icon: <CodeOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
            actions={[{
              key: 'add',
              label: '新增腳本',
              icon: <PlusOutlined />,
              onClick: () => {
                setSelectedScript(null)
                setIsScriptModalVisible(true)
              }
            }]}
          />

          <Table
            columns={scriptColumns}
            dataSource={scriptData}
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
            scroll={{ x: 800 }}
          />
        </div>
      ),
    },
    {
      key: 'schedules',
      label: '排程管理',
      icon: <ScheduleOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
            actions={[{
              key: 'add',
              label: '新增排程',
              icon: <PlusOutlined />,
              onClick: () => {
                setSelectedSchedule(null)
                setIsScheduleModalVisible(true)
              }
            }]}
          />

          <Table
            columns={scheduleColumns}
            dataSource={scheduleData}
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
            scroll={{ x: 800 }}
          />
        </div>
      ),
    },
    {
      key: 'logs',
      label: '執行日誌',
      icon: <HistoryOutlined />,
      children: (
        <div>
          <ToolbarActions
            onRefresh={handleRefresh}
            onSearch={handleSearch}
            onExport={handleExport}
          />

          <Table
            columns={logColumns}
            dataSource={logData}
            size="small"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 項，共 ${total} 項`,
            }}
            scroll={{ x: 800 }}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="自動化中心"
        subtitle="統一管理自動化腳本、排程任務和執行日誌"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        {kpiData.map((item, index) => (
          <ContextualKPICard
            key={index}
            title={item.title}
            value={item.value}
            description={item.description}
            trend={item.trend}
            status={item.status}
          />
        ))}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />

      {/* 腳本編輯模態框 */}
      <Modal
        title={selectedScript ? "編輯腳本" : "新增腳本"}
        open={isScriptModalVisible}
        onCancel={() => setIsScriptModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setIsScriptModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsScriptModalVisible(false)}>
            {selectedScript ? "更新" : "創建"}
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="腳本名稱" required>
            <Input placeholder="輸入腳本名稱" />
          </Form.Item>
          <Form.Item label="腳本類型" required>
            <Select placeholder="選擇腳本類型">
              <Select.Option value="shell">Shell</Select.Option>
              <Select.Option value="python">Python</Select.Option>
              <Select.Option value="ansible">Ansible</Select.Option>
              <Select.Option value="terraform">Terraform</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea placeholder="輸入腳本描述" rows={3} />
          </Form.Item>
          <Form.Item label="腳本內容">
            <Input.TextArea placeholder="輸入腳本代碼" rows={10} />
          </Form.Item>
          <Form.Item label="標籤">
            <Select mode="tags" placeholder="添加標籤" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 排程配置模態框 */}
      <Modal
        title={selectedSchedule ? "編輯排程" : "新增排程"}
        open={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setIsScheduleModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsScheduleModalVisible(false)}>
            {selectedSchedule ? "更新" : "創建"}
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="排程名稱" required>
            <Input placeholder="輸入排程名稱" />
          </Form.Item>
          <Form.Item label="關聯腳本" required>
            <Select placeholder="選擇關聯腳本">
              {scriptData.map(script => (
                <Select.Option key={script.id} value={script.id}>
                  {script.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="排程類型" required>
            <Select placeholder="選擇排程類型">
              <Select.Option value="one_time">單次執行</Select.Option>
              <Select.Option value="recurring">週期性執行</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Cron 表達式">
            <Input placeholder="0 2 * * *" />
          </Form.Item>
          <Form.Item label="並發策略">
            <Select placeholder="選擇並發策略">
              <Select.Option value="allow">允許並發</Select.Option>
              <Select.Option value="forbid">禁止並發</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="重試策略">
            <Select placeholder="選擇重試策略">
              <Select.Option value="none">不重試</Select.Option>
              <Select.Option value="retry_3">重試 3 次</Select.Option>
              <Select.Option value="retry_5">重試 5 次</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="通知設定">
            <div>
              <Switch checkedChildren="開啟" unCheckedChildren="關閉" defaultChecked />
              <span style={{ marginLeft: '8px' }}>成功通知</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Switch checkedChildren="開啟" unCheckedChildren="關閉" defaultChecked />
              <span style={{ marginLeft: '8px' }}>失敗通知</span>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* 執行日誌詳情模態框 */}
      <Modal
        title="執行日誌詳情"
        open={isLogDetailModalVisible}
        onCancel={() => setIsLogDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="retry" onClick={() => setIsLogDetailModalVisible(false)}>
            重試執行
          </Button>,
          <Button key="close" onClick={() => setIsLogDetailModalVisible(false)}>
            關閉
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Alert
            message="執行失敗"
            description="腳本執行過程中遇到錯誤，詳細錯誤信息如下："
            type="error"
            showIcon
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Card size="small" title="基本資訊">
            <div><strong>腳本名稱：</strong>Web 服務器健康檢查</div>
            <div><strong>觸發方式：</strong>排程</div>
            <div><strong>開始時間：</strong>2025-09-23 14:30:00</div>
            <div><strong>耗時：</strong>1.2 秒</div>
            <div><strong>狀態：</strong><span style={{ color: 'var(--brand-danger)' }}>失敗</span></div>
          </Card>

          <Card size="small" title="執行參數">
            <div><strong>環境：</strong>production</div>
            <div><strong>超時：</strong>300 秒</div>
            <div><strong>工作目錄：</strong>/opt/scripts</div>
            <div><strong>用戶：</strong>sre-user</div>
          </Card>
        </div>

        <Card size="small" title="輸出內容" style={{ marginBottom: '16px' }}>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            檢查完成，所有服務正常運行
          </div>
        </Card>

        <Card size="small" title="錯誤信息">
          <div style={{
            background: '#fff2f0',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #ffccc7',
            color: 'var(--brand-danger)'
          }}>
            磁碟空間不足，清理失敗
            <br />
            <strong>錯誤代碼：</strong> ENOSPC
            <br />
            <strong>影響文件：</strong> /var/log/system.log
          </div>
        </Card>
      </Modal>
    </div>
  )
}

export default AutomationPage
