import React from 'react';
import { Alert, Button, Space, Popconfirm } from 'antd';

interface IncidentsBatchActionsProps {
  selectedCount: number;
  onBatchAcknowledge: () => void;
  onBatchResolve: () => void;
  onClearSelection: () => void;
}

/**
 * 當告警表格中有項目被選中時顯示的批次操作工具列
 */
const IncidentsBatchActions: React.FC<IncidentsBatchActionsProps> = ({
  selectedCount,
  onBatchAcknowledge,
  onBatchResolve,
  onClearSelection,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const message = `已選取 ${selectedCount} 個告警`;

  const actions = (
    <Space>
      <Popconfirm
        title={`確定要批次確認這 ${selectedCount} 個告警嗎？`}
        onConfirm={onBatchAcknowledge}
        okText="確定"
        cancelText="取消"
      >
        <Button>批次確認</Button>
      </Popconfirm>
      <Popconfirm
        title={`確定要批次解決這 ${selectedCount} 個告警嗎？`}
        onConfirm={onBatchResolve}
        okText="確定"
        cancelText="取消"
      >
        <Button>批次解決</Button>
      </Popconfirm>
      <Button onClick={onClearSelection}>取消選取</Button>
    </Space>
  );

  return (
    <div style={{ marginBottom: 16 }}>
      <Alert message={message} type="info" showIcon action={actions} />
    </div>
  );
};

export default IncidentsBatchActions;
