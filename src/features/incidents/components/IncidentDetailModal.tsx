import React from 'react';
import { Modal, Tabs, Descriptions, Tag, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { Incident } from '../../../services/api-client';

const { Title, Paragraph } = Typography;

interface IncidentDetailModalProps {
  incident: Incident | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * 用於顯示單一告警詳細資訊的彈出視窗
 */
const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  visible,
  onClose,
}) => {
  if (!incident) {
    return null;
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '詳情',
      children: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="標題">{incident.title}</Descriptions.Item>
          <Descriptions.Item label="狀態">{incident.status}</Descriptions.Item>
          <Descriptions.Item label="等級">{incident.severity}</Descriptions.Item>
          <Descriptions.Item label="發生時間">{new Date(incident.created_at!).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="處理人員">{incident.assignee || '-'}</Descriptions.Item>
          <Descriptions.Item label="受影響資源">{incident.affected_resources?.join(', ')}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: '處理歷史',
      children: <Paragraph>處理歷史紀錄功能待開發。</Paragraph>,
    },
    {
      key: '3',
      label: '關聯事件',
      children: <Paragraph>關聯事件功能待開發。</Paragraph>,
    },
    {
      key: '4',
      label: '自動化',
      children: <Paragraph>自動化紀錄功能待開發。</Paragraph>,
    },
  ];

  return (
    <Modal
      title={<Title level={4}>告警詳情: {incident.title}</Title>}
      open={visible}
      onCancel={onClose}
      footer={null} // 自訂頁腳或無頁腳
      width={800}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};

export default IncidentDetailModal;
