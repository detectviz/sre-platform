import React, { useState } from 'react';
import { Typography, message } from 'antd';
import {
  useListTeamsQuery,
  useDeleteTeamMutation,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  // useBatchDeleteTeamsMutation, // This hook is now removed
} from '../../services/organizationApi';
import TeamsTable from '../../features/organization/components/TeamsTable';
import TeamsFilter from '../../features/organization/components/TeamsFilter';
import TeamFormModal from '../../features/organization/components/TeamFormModal';
// import TeamsBatchActions from '../../features/organization/components/TeamsBatchActions'; // This component is now removed
import type { Team } from '../../services/api-client';

const { Title } = Typography;

/**
 * 團隊管理主頁面
 */
const TeamsPage: React.FC = () => {
  // 狀態管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState({ page: 1, page_size: 10, search: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // RTK Query Hooks
  const { data, isLoading, isFetching } = useListTeamsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteTeam] = useDeleteTeamMutation();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  // const [batchDeleteTeams, { isLoading: isBatchDeleting }] = useBatchDeleteTeamsMutation(); // This hook is now removed

  // 處理篩選
  const handleApplyFilters = (filters: { search?: string }) => {
    setQueryParams(prev => ({ ...prev, page: 1, search: filters.search || '' }));
  };

  // 處理表格變化
  const handleTableChange = (pagination: any) => {
    setQueryParams(prev => ({ ...prev, page: pagination.current, page_size: pagination.pageSize }));
  };

  // 處理刪除
  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id).unwrap();
      message.success('團隊已刪除');
    } catch {
      message.error('刪除失敗');
    }
  };

  // 處理批次刪除 (功能已移除)
  // const handleBatchDelete = async () => { ... };

  // 處理編輯
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalVisible(true);
  };

  // 處理新增
  const handleAddTeam = () => {
    setEditingTeam(null);
    setIsModalVisible(true);
  };

  // 處理 Modal 的確認按鈕
  const handleModalOk = async (values: any) => {
    const teamPayload = { team: { name: values.name, subscriber_ids: values.subscriber_ids } };
    try {
      if (editingTeam) {
        await updateTeam({ id: editingTeam.id!, ...teamPayload }).unwrap();
        message.success('更新成功');
      } else {
        await createTeam(teamPayload).unwrap();
        message.success('新增成功');
      }
      setIsModalVisible(false);
    } catch {
      message.error('操作失敗');
    }
  };

  // 處理 Modal 的取消按鈕
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Title level={2}>團隊管理</Title>
      <TeamsFilter onApplyFilters={handleApplyFilters} onAddTeam={handleAddTeam} />
      {/* Batch actions removed as the API endpoint is not available */}
      <TeamsTable
        data={data?.items}
        pagination={data?.pagination}
        loading={isLoading || isFetching}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TeamFormModal
        visible={isModalVisible}
        loading={isCreating || isUpdating}
        initialData={editingTeam}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
};

export default TeamsPage;
