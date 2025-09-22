import React, 'react';
import { Table, Spin, Alert, Switch, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useSilences, Silence } from '../../hooks/useSilences'; // 引入 Silence 型別
import SilenceRuleForm from './SilenceRuleForm'; // 引入表單元件

/**
 * @description 靜音規則列表頁面
 * - 使用 useSilences hook 獲取數據
 * - 管理新增/編輯彈窗的狀態
 * - 處理資料的 CUD (Create, Update, Delete) 操作
 */
const SilenceRulePage: React.FC = () => {
  // 從 hook 獲取數據和操作函式
  const { silences, loading, error, addSilence, updateSilence, deleteSilence } = useSilences();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingSilence, setEditingSilence] = React.useState<Partial<Silence> | undefined>(undefined);

  // 顯示新增彈窗
  const showAddModal = () => {
    setEditingSilence(undefined);
    setIsModalVisible(true);
  };

  // 顯示編輯彈窗
  const showEditModal = (record: Silence) => {
    setEditingSilence(record);
    setIsModalVisible(true);
  };

  // 關閉彈窗
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSilence(undefined);
  };

  // 處理刪除操作
  const handleDelete = async (id: string) => {
    try {
      await deleteSilence(id);
      message.success('刪除成功');
    } catch (e) {
      message.error('刪除失敗');
    }
  };

  // 表單提交處理
  const handleFormSubmit = async (values: Partial<Silence>) => {
    try {
      if (editingSilence?.id) {
        // 更新模式
        await updateSilence(editingSilence.id, values);
        message.success('更新成功');
      } else {
        // 新增模式
        await addSilence(values);
        message.success('新增成功');
      }
      setIsModalVisible(false);
      setEditingSilence(undefined);
    } catch (e) {
      message.error('操作失敗');
    }
  };

  // 表格欄位定義
  const columns: ColumnsType<Silence> = [
    {
      title: '啟用',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => <Switch checked={enabled} disabled />,
    },
    {
      title: '規則名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '靜音條件',
      dataIndex: 'matchers',
      key: 'matchers',
      render: (matchers: string) => <Tag color="geekblue">{matchers}</Tag>,
    },
    {
      title: '靜音期間',
      dataIndex: 'time_range',
      key: 'time_range',
    },
    {
      title: '創建者',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString('zh-TW'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>編輯</a>
          <a onClick={() => handleDelete(record.id)}>刪除</a>
        </Space>
      ),
    },
  ];

  // 處理載入狀態
  if (loading) {
    return <Spin size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  // 處理錯誤狀態
  if (error) {
    return <Alert message="錯誤" description={error.message} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>靜音規則</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          新增規則
        </Button>
      </div>
      <Table columns={columns} dataSource={silences} rowKey="id" />
      <SilenceRuleForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleFormSubmit}
        initialValues={editingSilence}
      />
    </div>
  );
};

export default SilenceRulePage;
