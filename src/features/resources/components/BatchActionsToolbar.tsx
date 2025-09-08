import React from 'react';
import { Alert, Button, Space, Popconfirm } from 'antd';

interface BatchActionsToolbarProps {
  selectedCount: number;
  onBatchDelete: () => void;
  onClearSelection: () => void;
}

/**
 * 當表格中有項目被選中時顯示的批次操作工具列
 */
const BatchActionsToolbar: React.FC<BatchActionsToolbarProps> = ({
  selectedCount,
  onBatchDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const message = `已選取 ${selectedCount} 個項目`;

  const actions = (
    <Space>
      <Popconfirm
        title={`確定要刪除這 ${selectedCount} 個資源嗎？`}
        onConfirm={onBatchDelete}
        okText="確定"
        cancelText="取消"
      >
        <Button type="primary" danger>
          批次刪除
        </Button>
      </Popconfirm>
      {/* 可以在此處加入更多批次操作按鈕，例如 "批次加入群組" */}
      <Button onClick={onClearSelection}>取消選取</Button>
    </Space>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <Alert message={message} type="info" showIcon action={actions} />
    </div>
  );
};

export default BatchActionsToolbar;
