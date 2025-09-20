import React, { useMemo } from 'react';
import { Tree, Typography, Spin } from 'antd';
import type { TreeProps } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
  AlertOutlined,
  DatabaseOutlined,
  SettingOutlined,
  FileTextOutlined,
  MonitorOutlined,
  CloudServerOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// 權限樹狀結構定義
const PERMISSION_TREE = [
  {
    title: '事件管理',
    key: 'incidents',
    icon: <AlertOutlined />,
    children: [
      { title: '查看事件', key: 'incidents:read', selectable: true },
      { title: '建立事件', key: 'incidents:create', selectable: true },
      { title: '更新事件', key: 'incidents:update', selectable: true },
      { title: '刪除事件', key: 'incidents:delete', selectable: true },
      { title: '建立靜音', key: 'incidents:silence', selectable: true },
      { title: 'AI 分析', key: 'incidents:ai-analysis', selectable: true },
    ]
  },
  {
    title: '資源管理',
    key: 'resources',
    icon: <DatabaseOutlined />,
    children: [
      { title: '查看資源', key: 'resources:read', selectable: true },
      { title: '建立資源', key: 'resources:create', selectable: true },
      { title: '更新資源', key: 'resources:update', selectable: true },
      { title: '刪除資源', key: 'resources:delete', selectable: true },
      { title: '管理群組', key: 'resources:groups', selectable: true },
    ]
  },
  {
    title: '儀表板',
    key: 'dashboards',
    icon: <MonitorOutlined />,
    children: [
      { title: '查看儀表板', key: 'dashboards:read', selectable: true },
      { title: '建立儀表板', key: 'dashboards:create', selectable: true },
      { title: '更新儀表板', key: 'dashboards:update', selectable: true },
      { title: '刪除儀表板', key: 'dashboards:delete', selectable: true },
    ]
  },
  {
    title: '自動化中心',
    key: 'automation',
    icon: <PlayCircleOutlined />,
    children: [
      { title: '查看腳本', key: 'automation:read', selectable: true },
      { title: '建立腳本', key: 'automation:create', selectable: true },
      { title: '執行腳本', key: 'automation:execute', selectable: true },
      { title: '刪除腳本', key: 'automation:delete', selectable: true },
      { title: '管理排程', key: 'automation:schedule', selectable: true },
    ]
  },
  {
    title: '身份管理',
    key: 'identity',
    icon: <UserOutlined />,
    children: [
      { title: '查看使用者', key: 'identity:users:read', selectable: true },
      { title: '邀請使用者', key: 'identity:users:create', selectable: true },
      { title: '編輯使用者', key: 'identity:users:update', selectable: true },
      { title: '刪除使用者', key: 'identity:users:delete', selectable: true },
      { title: '管理團隊', key: 'identity:teams:manage', selectable: true },
      { title: '管理角色', key: 'identity:roles:manage', selectable: true },
    ]
  },
  {
    title: '通知管理',
    key: 'notifications',
    icon: <CloudServerOutlined />,
    children: [
      { title: '查看通知策略', key: 'notifications:policies:read', selectable: true },
      { title: '建立通知策略', key: 'notifications:policies:create', selectable: true },
      { title: '更新通知策略', key: 'notifications:policies:update', selectable: true },
      { title: '刪除通知策略', key: 'notifications:policies:delete', selectable: true },
      { title: '管理通知管道', key: 'notifications:channels:manage', selectable: true },
    ]
  },
  {
    title: '系統設定',
    key: 'system',
    icon: <SettingOutlined />,
    children: [
      { title: '查看系統設定', key: 'system:settings:read', selectable: true },
      { title: '更新系統設定', key: 'system:settings:update', selectable: true },
      { title: '查看審計日誌', key: 'system:audit:read', selectable: true },
      { title: '匯出審計日誌', key: 'system:audit:export', selectable: true },
    ]
  }
];

interface PermissionTreeSelectorProps {
  value?: string[];
  onChange?: (selectedPermissions: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

const PermissionTreeSelector: React.FC<PermissionTreeSelectorProps> = ({
  value = [],
  onChange,
  loading = false,
  disabled = false
}) => {

  // 將扁平的權限列表轉換為樹狀結構所需的 checked keys
  const checkedKeys = useMemo(() => {
    return value;
  }, [value]);

  // 處理樹狀選擇器的變更
  const handleCheck: TreeProps['onCheck'] = (checked, { checkedNodes }) => {
    if (Array.isArray(checked)) {
      // 只選擇可選擇的節點（即具體權限，不包括分類節點）
      const selectedPermissions = checked.filter(key => {
        const node = checkedNodes?.find(n => n.key === key);
        return node?.selectable;
      });
      onChange?.(selectedPermissions as string[]);
    }
  };

  // 渲染樹狀節點標題
  const renderTreeTitle = (node: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {node.icon}
      <Text style={{ fontSize: node.selectable ? 14 : 16, fontWeight: node.selectable ? 'normal' : '500' }}>
        {node.title}
      </Text>
    </div>
  );

  // 為樹狀數據添加渲染的標題
  const treeDataWithRenderedTitles = useMemo(() => {
    const renderNode = (node: any): any => ({
      ...node,
      title: renderTreeTitle(node),
      children: node.children?.map(renderNode)
    });

    return PERMISSION_TREE.map(renderNode);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">載入權限資料中...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
      padding: 16,
      maxHeight: 400,
      overflowY: 'auto',
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(10px)'
    }}>
      <Tree
        checkable
        checkedKeys={checkedKeys}
        onCheck={handleCheck}
        treeData={treeDataWithRenderedTitles}
        defaultExpandAll
        disabled={disabled}
        showLine={{ showLeafIcon: false }}
        style={{
          background: 'transparent',
        }}
      />
    </div>
  );
};

export default PermissionTreeSelector;