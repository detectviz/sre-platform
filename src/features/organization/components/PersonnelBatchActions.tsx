import React from 'react';
import { Button, Typography, Space, Popconfirm } from 'antd';

const { Text } = Typography;

interface PersonnelBatchActionsProps {
  selectedCount: number;
  onBatchDelete: () => void;
  onClearSelection: () => void;
}

/**
 * 人員管理批次操作工具列
 */
const PersonnelBatchActions: React.FC<PersonnelBatchActionsProps> = ({
  selectedCount,
  onBatchDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Space
      style={{
        marginBottom: 16,
        padding: '8px 12px',
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: 4,
        width: '100%',
      }}
    >
      <Text strong>已選取 {selectedCount} 位人員</Text>
      <Popconfirm
        title={`確定要刪除這 ${selectedCount} 位人員嗎？`}
        onConfirm={onBatchDelete}
        okText="確定"
        cancelText="取消"
      >
        <Button type="primary" danger>
          批次刪除
        </Button>
      </Popconfirm>
      <Button onClick={onClearSelection}>清除選取</Button>
    </Space>
  );
};

export default PersonnelBatchActions;
