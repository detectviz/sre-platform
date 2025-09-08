import React, { useState, useMemo } from 'react';
import { Typography, message } from 'antd';
import {
  useListResourcesQuery,
  useDeleteResourceMutation,
  useBatchOperateResourcesMutation,
} from '../services/resourcesApi';
import ResourceTable from '../features/resources/components/ResourceTable';
import ResourceFilters from '../features/resources/components/ResourceFilters';
import BatchActionsToolbar from '../features/resources/components/BatchActionsToolbar';

const { Title } = Typography;

/**
 * 資源管理主頁面
 * 作為容器元件，負責管理狀態、獲取數據並將其傳遞給子元件。
 */
const ResourcesPage: React.FC = () => {
  // 狀態管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState({
    page: 1,
    page_size: 10,
    search: '',
    status: undefined,
    // 其他篩選條件...
  });

  // RTK Query Hooks
  const { data: resourceData, isLoading, isFetching, error } = useListResourcesQuery(queryParams);
  const [deleteResource, { isLoading: isDeleting }] = useDeleteResourceMutation();
  const [batchOperateResources, { isLoading: isBatchProcessing }] = useBatchOperateResourcesMutation();

  // 記憶查詢參數，避免不必要的重新渲染
  const memoizedQueryParams = useMemo(() => queryParams, [queryParams]);

  // 事件處理函數
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current,
      page_size: pagination.pageSize,
      // sorter 處理...
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setQueryParams(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setQueryParams(prev => ({ ...prev, [filterType]: value, page: 1 }));
  };

  const handleDelete = async (resourceId: string) => {
    try {
      await deleteResource({ resourceId }).unwrap();
      message.success('資源刪除成功');
    } catch {
      message.error('資源刪除失敗');
    }
  };

  const handleBatchDelete = async () => {
    try {
      await batchOperateResources({
        operation: 'delete',
        resource_ids: selectedRowKeys as string[],
      }).unwrap();
      message.success('批次刪除成功');
      setSelectedRowKeys([]); // 清空選取
    } catch {
      message.error('批次刪除失敗');
    }
  };

  return (
    <div>
      <Title level={2}>資源管理</Title>
      <ResourceFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAdd={() => message.info('新增資源功能待開發')}
        onScan={() => message.info('掃描網路功能待開發')}
      />
      <BatchActionsToolbar
        selectedCount={selectedRowKeys.length}
        onBatchDelete={handleBatchDelete}
        onClearSelection={() => setSelectedRowKeys([])}
      />
      <ResourceTable
        data={resourceData?.items}
        pagination={resourceData?.pagination}
        loading={isLoading || isFetching || isDeleting || isBatchProcessing}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onTableChange={handleTableChange}
        onDelete={handleDelete}
        onEdit={(resource) => message.info(`編輯 ${resource.name} 功能待開發`)}
      />
    </div>
  );
};

export default ResourcesPage;
