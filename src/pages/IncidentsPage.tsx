import React, { useState, useMemo } from 'react';
import { Typography, message } from 'antd';
import {
  useListIncidentsQuery,
  useBatchUpdateIncidentsMutation,
} from '../services/incidentsApi';
import IncidentsTable from '../features/incidents/components/IncidentsTable';
import IncidentsFilter from '../features/incidents/components/IncidentsFilter';
import IncidentsBatchActions from '../features/incidents/components/IncidentsBatchActions';
import IncidentDetailModal from '../features/incidents/components/IncidentDetailModal';
import { Incident } from '../services/api-client';

const { Title } = Typography;

/**
 * 告警紀錄主頁面
 * 作為容器元件，負責管理狀態、獲取數據並將其傳遞給子元件。
 */
const IncidentsPage: React.FC = () => {
  // 狀態管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // RTK Query Hooks
  const { data, isLoading, isFetching, error } = useListIncidentsQuery(queryParams);
  const [batchUpdateIncidents, { isLoading: isBatchProcessing }] = useBatchUpdateIncidentsMutation();

  const handleApplyFilters = (filters: any) => {
    setQueryParams({ ...queryParams, ...filters, page: 1 });
  };

  const handleTableChange = (pagination: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleShowDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalVisible(true);
  };

  const handleBatchAction = async (operation: 'acknowledged' | 'resolved') => {
    try {
      await batchUpdateIncidents({
        operation,
        incident_ids: selectedRowKeys as string[],
      }).unwrap();
      message.success(`批次${operation === 'acknowledged' ? '確認' : '解決'}成功`);
      setSelectedRowKeys([]);
    } catch {
      message.error(`批次操作失敗`);
    }
  };

  return (
    <div>
      <Title level={2}>告警紀錄</Title>
      <IncidentsFilter
        onApplyFilters={handleApplyFilters}
        onGenerateReport={() => message.info('AI 報告功能待開發')}
      />
      <IncidentsBatchActions
        selectedCount={selectedRowKeys.length}
        onBatchAcknowledge={() => handleBatchAction('acknowledged')}
        onBatchResolve={() => handleBatchAction('resolved')}
        onClearSelection={() => setSelectedRowKeys([])}
      />
      <IncidentsTable
        data={data?.items}
        pagination={data?.pagination}
        loading={isLoading || isFetching || isBatchProcessing}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onTableChange={handleTableChange}
        onShowDetails={handleShowDetails}
        onAcknowledge={(id) => handleBatchAction('acknowledged')} // 單筆確認可複用批次操作
      />
      <IncidentDetailModal
        incident={selectedIncident}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default IncidentsPage;
