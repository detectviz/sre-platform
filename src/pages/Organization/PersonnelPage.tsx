import React, { useState } from 'react';
import { Typography, message } from 'antd';
import {
  useListUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useBatchDeleteUsersMutation,
} from '../../services/organizationApi';
import PersonnelTable from '../../features/organization/components/PersonnelTable';
import PersonnelFilter from '../../features/organization/components/PersonnelFilter';
import PersonnelFormModal from '../../features/organization/components/PersonnelFormModal';
import PersonnelBatchActions from '../../features/organization/components/PersonnelBatchActions';
import type { User } from '../../services/api-client';

const { Title } = Typography;

/**
 * 人員管理主頁面
 */
const PersonnelPage: React.FC = () => {
  // 狀態管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState({ page: 1, page_size: 10, search: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // RTK Query Hooks
  const { data, isLoading, isFetching } = useListUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteUser] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [batchDeleteUsers, { isLoading: isBatchDeleting }] = useBatchDeleteUsersMutation();

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
      await deleteUser(id).unwrap();
      message.success('人員已刪除');
    } catch {
      message.error('刪除失敗');
    }
  };

  // 處理批次刪除
  const handleBatchDelete = async () => {
    try {
      await batchDeleteUsers(selectedRowKeys as string[]).unwrap();
      message.success('批次刪除成功');
      setSelectedRowKeys([]);
    } catch {
      message.error('批次刪除失敗');
    }
  };

  // 處理編輯
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  // 處理新增
  const handleAddPersonnel = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  // 處理 Modal 的確認按鈕
  const handleModalOk = async (values: any) => {
    const userPayload = { user: { name: values.name, role: values.role, team_ids: values.team_ids } };
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id!, ...userPayload }).unwrap();
        message.success('更新成功');
      } else {
        await createUser(userPayload).unwrap();
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
      <Title level={2}>人員管理</Title>
      <PersonnelFilter onApplyFilters={handleApplyFilters} onAddPersonnel={handleAddPersonnel} />
      <PersonnelBatchActions
        selectedCount={selectedRowKeys.length}
        onBatchDelete={handleBatchDelete}
        onClearSelection={() => setSelectedRowKeys([])}
      />
      <PersonnelTable
        data={data?.items}
        pagination={data?.pagination}
        loading={isLoading || isFetching || isBatchDeleting}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={setSelectedRowKeys}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <PersonnelFormModal
        visible={isModalVisible}
        loading={isCreating || isUpdating}
        initialData={editingUser}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
};

export default PersonnelPage;
