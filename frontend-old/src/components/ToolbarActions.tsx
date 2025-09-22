import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PlusOutlined,
  ControlOutlined,
} from '@ant-design/icons';

interface ToolbarActionsProps {
  onRefresh?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
  onBatchAction?: () => void;
  filterActive?: boolean;
  searchPlaceholder?: string;
  showRefresh?: boolean;
  showSearch?: boolean;
  showExport?: boolean;
  showAdd?: boolean;
  showBatchAction?: boolean;
  showFilter?: boolean;
  customActions?: React.ReactNode[];
}

export const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  onRefresh,
  onSearch,
  onExport,
  onAdd,
  onFilter,
  onBatchAction,
  filterActive = false,
  searchPlaceholder = '搜索...',
  showRefresh = false,
  showSearch = false,
  showExport = false,
  showAdd = false,
  showBatchAction = false,
  showFilter = false,
  customActions = [],
}) => {
  const primaryActions = [];
  const secondaryActions = [];

  // 主要操作按鈕
  if (showRefresh && onRefresh) {
    primaryActions.push(
      <Tooltip key="refresh" title="重新整理">
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          type="text"
        />
      </Tooltip>
    );
  }

  if (showAdd && onAdd) {
    primaryActions.push(
      <Tooltip key="add" title="新增">
        <Button
          icon={<PlusOutlined />}
          onClick={onAdd}
          type="primary"
        />
      </Tooltip>
    );
  }

  if (showSearch && onSearch) {
    primaryActions.push(
      <Tooltip key="search" title={searchPlaceholder.replace('搜索...', '') || '搜索'}>
        <Button
          icon={<SearchOutlined />}
          onClick={onSearch}
          type="text"
        />
      </Tooltip>
    );
  }

  // 次要操作按鈕
  if (showFilter && onFilter) {
    secondaryActions.push(
      <Tooltip key="filter" title="篩選">
        <Button
          icon={<FilterOutlined />}
          onClick={onFilter}
          type={filterActive ? 'primary' : 'text'}
        />
      </Tooltip>
    );
  }

  if (showExport && onExport) {
    secondaryActions.push(
      <Tooltip key="export" title="匯出">
        <Button
          icon={<DownloadOutlined />}
          onClick={onExport}
          type="text"
        />
      </Tooltip>
    );
  }

  if (showBatchAction && onBatchAction) {
    secondaryActions.push(
      <Tooltip key="batch" title="批量操作">
        <Button
          icon={<ControlOutlined />}
          onClick={onBatchAction}
          type="text"
        />
      </Tooltip>
    );
  }

  return (
    <Space size="middle">
      {/* 主要操作 */}
      {primaryActions.length > 0 && (
        <Space size="small">
          {primaryActions}
        </Space>
      )}

      {/* 次要操作 */}
      {secondaryActions.length > 0 && (
        <Space size="small">
          {secondaryActions}
        </Space>
      )}

      {/* 自訂操作 */}
      {customActions.length > 0 && (
        <Space size="small">
          {customActions}
        </Space>
      )}
    </Space>
  );
};
