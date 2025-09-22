import React from 'react';
import { Space, Spin, Row, Col } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { ContextualKPICard } from '../components/ContextualKPICard';
import { ToolbarActions } from '../components/ToolbarActions.tsx';
import { DataTable } from '../components/DataTable';
import {
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

const DashboardListPage: React.FC<{ onNavigate?: () => void }> = ({ onNavigate: _ }) => {
  const [loading] = React.useState(false);

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 120 }}>
        <Spin tip="正在載入儀表板資料..." size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="儀表板管理"
        subtitle="統一的系統監控與業務洞察儀表板入口"
        description="創建、發布和管理各種監控儀表板。"
      />

      <ToolbarActions
        onRefresh={() => { }}
        onSearch={() => { }}
        onExport={() => { }}
        onAdd={() => { }}
        onFilter={() => { }}
        searchPlaceholder="搜索儀表板名稱..."
        showRefresh={true}
        showSearch={true}
        showExport={true}
        showAdd={true}
        showBatchAction={true}
        showFilter={true}
      />

      <DataTable
        columns={[
          { title: '名稱', dataIndex: 'name', key: 'name' },
          { title: '類別', dataIndex: 'category', key: 'category' },
          { title: '擁有者', dataIndex: 'owner', key: 'owner' },
          { title: '瀏覽/收藏', dataIndex: 'views_favorites', key: 'views_favorites' },
          { title: '更新時間', dataIndex: 'updated_at', key: 'updated_at' },
        ]}
        dataSource={[]}
        loading={false}
        onRow={() => ({})}
      />
    </Space>
  );
};

export default DashboardListPage;
