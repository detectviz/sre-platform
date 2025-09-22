import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  App as AntdApp,
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  List,
  Row,
  Segmented,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps, TabsProps } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  BranchesOutlined,
  CloudServerOutlined,
  LineChartOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  StarOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ContextualKPICard, DataTable, PageHeader } from '../components';
import type { ContextualKPICardProps, KPIStatus } from '../components/ContextualKPICard';
import useDashboards from '../hooks/useDashboards';
import type { DashboardCategory, DashboardDefinition } from '../types/dashboards';

const { Text } = Typography;

type DashboardKpiCard = {
  key: string;
} & Pick<ContextualKPICardProps, 'title' | 'value' | 'unit' | 'status' | 'description' | 'icon'>;

const categoryMeta: Record<DashboardCategory, {
  label: string;
  description: string;
  icon: ReactNode;
  tone: KPIStatus;
  accent: string;
}> = {
  infrastructure: {
    label: '基礎設施洞察',
    description: '雲資源、系統健康與容量趨勢',
    icon: <CloudServerOutlined />,
    tone: 'info',
    accent: '#1890ff',
  },
  business: {
    label: '業務與 SLA 指標',
    description: '跨團隊服務品質與使用者體驗',
    icon: <BarChartOutlined />,
    tone: 'success',
    accent: '#52c41a',
  },
  operations: {
    label: '營運與容量',
    description: '容量規劃、成本與資源利用率',
    icon: <BranchesOutlined />,
    tone: 'warning',
    accent: '#faad14',
  },
  automation: {
    label: '自動化與效率',
    description: '腳本成效、ROI 及節省工時',
    icon: <ThunderboltOutlined />,
    tone: 'info',
    accent: '#9254de',
  },
  custom: {
    label: '團隊自訂',
    description: '部門或專案的客製儀表板',
    icon: <AppstoreOutlined />,
    tone: 'info',
    accent: '#13c2c2',
  },
};

type DashboardAdministrationPageProps = {
  onNavigate?: (key: string, params?: Record<string, unknown>) => void;
};

const DashboardAdministrationPage = ({ onNavigate: _onNavigate }: DashboardAdministrationPageProps) => {
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const { dashboards, stats, categorized, loading, error, isFallback, refresh } = useDashboards();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [tableCategoryFilter, setTableCategoryFilter] = useState<'ALL' | DashboardCategory>('ALL');
  const [defaultDashboardId, setDefaultDashboardId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sre-platform/default-dashboard');
  });

  useEffect(() => {
    if (defaultDashboardId) {
      const exists = dashboards.some((item) => item.id === defaultDashboardId);
      if (!exists) {
        setDefaultDashboardId(dashboards.find((item) => item.isDefault)?.id ?? dashboards[0]?.id ?? null);
      }
    } else {
      setDefaultDashboardId(dashboards.find((item) => item.isDefault)?.id ?? dashboards[0]?.id ?? null);
    }
  }, [dashboards, defaultDashboardId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (defaultDashboardId) {
      localStorage.setItem('sre-platform/default-dashboard', defaultDashboardId);
    } else {
      localStorage.removeItem('sre-platform/default-dashboard');
    }
  }, [defaultDashboardId]);

  const handleSetDefault = useCallback((dashboard: DashboardDefinition) => {
    setDefaultDashboardId(dashboard.id);
    message.success(`已將「${dashboard.name}」設為預設儀表板`);
  }, [message]);

  const handleOpenDashboard = useCallback((dashboard: DashboardDefinition) => {
    // Map targetPageKey to actual routes
    const routeMapping: Record<string, string> = {
      'infrastructure-insights': '/resources',
      'war-room': '/',
      'capacity-planning': '/automation/capacity-planning',
    };

    const target = routeMapping[dashboard.targetPageKey ?? ''] ?? '/';
    navigate(target);
  }, [navigate]);

  const handleCloneDashboard = useCallback((dashboard: DashboardDefinition) => {
    message.info(`已複製「${dashboard.name}」的儀表板設定 (模擬)`);
  }, [message]);

  const handleShareDashboard = useCallback((dashboard: DashboardDefinition) => {
    message.success(`已產生「${dashboard.name}」的分享連結 (模擬)`);
  }, [message]);

  const tableData = useMemo(() => {
    if (tableCategoryFilter === 'ALL') {
      return dashboards;
    }
    return dashboards.filter((item) => item.category === tableCategoryFilter);
  }, [dashboards, tableCategoryFilter]);

  const columns = useMemo(() => {
    const items: MenuProps['items'] = [
      {
        key: 'duplicate',
        label: '複製儀表板',
      },
      {
        key: 'share',
        label: '分享設定',
      },
    ];

    const handleMenuClick = (dashboard: DashboardDefinition, info: Parameters<NonNullable<MenuProps['onClick']>>[0]) => {
      if (info.key === 'duplicate') {
        handleCloneDashboard(dashboard);
      }
      if (info.key === 'share') {
        handleShareDashboard(dashboard);
      }
    };

    return [
      {
        title: '名稱',
        dataIndex: 'name',
        key: 'name',
        render: (_: unknown, record: DashboardDefinition) => (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <Space size={8} wrap>
              <Text strong>{record.name}</Text>
              {record.id === defaultDashboardId && <Tag color="gold">預設</Tag>}
              {record.status === 'draft' && <Tag color="cyan">草稿</Tag>}
              {record.isFeatured && <Tag color="purple">精選</Tag>}
            </Space>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description}
              </Text>
            )}
            {record.tags && record.tags.length > 0 && (
              <Space size={[4, 4]} wrap>
                {record.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
                {record.tags.length > 3 && <Tag>+{record.tags.length - 3}</Tag>}
              </Space>
            )}
          </Space>
        ),
      },
      {
        title: '類別',
        dataIndex: 'category',
        key: 'category',
        render: (value: DashboardCategory) => (
          <Tag color={categoryMeta[value]?.accent}>{categoryMeta[value]?.label ?? value}</Tag>
        ),
      },
      {
        title: '擁有者',
        dataIndex: 'owner',
        key: 'owner',
        render: (owner?: string) => owner ?? '—',
      },
      {
        title: '瀏覽 / 收藏',
        key: 'engagement',
        render: (_: unknown, record: DashboardDefinition) => (
          <Text type="secondary">{record.viewers ?? 0} / {record.favoriteCount ?? 0}</Text>
        ),
      },
      {
        title: '更新時間',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value?: string) => (value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—'),
      },
      {
        title: '操作',
        key: 'actions',
        width: 240,
        render: (_: unknown, record: DashboardDefinition) => (
          <Space size={4} wrap>
            <Button type="link" onClick={() => handleOpenDashboard(record)}>
              開啟
            </Button>
            <Button
              type="link"
              onClick={() => handleSetDefault(record)}
              disabled={record.id === defaultDashboardId}
            >
              設為預設
            </Button>
            <Dropdown
              trigger={['click']}
              menu={{
                items,
                onClick: (info) => handleMenuClick(record, info),
              }}
            >
              <Button type="link">更多</Button>
            </Dropdown>
          </Space>
        ),
      },
    ];
  }, [defaultDashboardId, handleCloneDashboard, handleOpenDashboard, handleSetDefault, handleShareDashboard]);

  const automationTone: KPIStatus = stats.automationCoverage >= 60 ? 'success' : 'warning';
  const kpiCards = useMemo<DashboardKpiCard[]>(() => ([
    {
      key: 'total',
      title: '儀表板總數',
      value: stats.totalDashboards,
      unit: '個',
      status: 'info',
      description: stats.lastUpdatedAt ? `最後更新：${dayjs(stats.lastUpdatedAt).fromNow()}` : undefined,
      icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
    },
    {
      key: 'published',
      title: '已發布',
      value: stats.publishedDashboards,
      unit: '個',
      status: 'success',
      description: '可供所有角色使用',
      icon: <ShareAltOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
    },
    {
      key: 'custom',
      title: '自訂儀表板',
      value: stats.customDashboards,
      unit: '個',
      status: 'warning',
      description: '由團隊自行建立',
      icon: <UserOutlined style={{ fontSize: 28, color: '#faad14' }} />,
    },
    {
      key: 'automation',
      title: '自動化覆蓋率',
      value: stats.automationCoverage,
      unit: '%',
      status: automationTone,
      description: '有自動更新資料的儀表板',
      icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#9254de' }} />,
    },
  ]), [automationTone, stats]);

  const popularDashboards = useMemo(
    () => [...dashboards].sort((a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0)).slice(0, 5),
    [dashboards],
  );

  const overviewContent = (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {Object.keys(categoryMeta).map((key) => {
          const categoryKey = key as DashboardCategory;
          const items = categorized[categoryKey] ?? [];
          const meta = categoryMeta[categoryKey];
          return (
            <Col key={categoryKey} xs={24} md={12} xl={8}>
              <Card
                className="nav-item"
                title={
                  <Space size={12} align="start">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `${meta.accent}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: meta.accent,
                        fontSize: 20,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <Space direction="vertical" size={0}>
                      <Text strong>{meta.label}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {meta.description}
                      </Text>
                    </Space>
                  </Space>
                }
                extra={<Badge count={items.length} style={{ backgroundColor: meta.accent }} />}
                styles={{ body: { paddingTop: 16 } }}
              >
                {items.length === 0 ? (
                  <Empty description="尚無儀表板" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={items.slice(0, 3)}
                    split={false}
                    renderItem={(item) => (
                      <List.Item
                        style={{ padding: '12px 0' }}
                        actions={[
                          <Button
                            key="open"
                            type="link"
                            size="small"
                            onClick={() => handleOpenDashboard(item)}
                          >
                            開啟
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space size={8} wrap>
                              <Text strong>{item.name}</Text>
                              {item.id === defaultDashboardId && <Tag color="gold">預設</Tag>}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                擁有者：{item.owner ?? '未指定'}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                更新於：{item.updatedAt ? dayjs(item.updatedAt).fromNow() : '未知'}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}

                <Button
                  block
                  type="text"
                  onClick={() => {
                    setTableCategoryFilter(categoryKey);
                    setActiveTab('library');
                  }}
                >
                  查看此分類的所有儀表板
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="nav-item" title="熱門儀表板">
        {popularDashboards.length === 0 ? (
          <Empty description="暫無統計資料" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={popularDashboards}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tooltip key="favorite" title="收藏數">
                    <Space size={4}>
                      <StarOutlined style={{ color: '#faad14' }} />
                      <span>{item.favoriteCount ?? 0}</span>
                    </Space>
                  </Tooltip>,
                  <Tooltip key="viewer" title="瀏覽次數">
                    <Space size={4}>
                      <LineChartOutlined style={{ color: '#1890ff' }} />
                      <span>{item.viewers ?? 0}</span>
                    </Space>
                  </Tooltip>,
                  <Button key="open" type="link" onClick={() => handleOpenDashboard(item)}>
                    開啟
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size={8}>
                      <Text strong>{item.name}</Text>
                      <Tag color={categoryMeta[item.category]?.accent}>
                        {categoryMeta[item.category]?.label ?? item.category}
                      </Tag>
                    </Space>
                  }
                  description={item.description}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );

  const libraryContent = (
    <DataTable<DashboardDefinition>
      rowKey={(record) => record.id}
      dataSource={tableData}
      columns={columns}
      loading={loading}
      titleContent={
        <Space wrap>
          <Segmented
            value={tableCategoryFilter}
            onChange={(value) => setTableCategoryFilter(value as typeof tableCategoryFilter)}
            options={[
              { label: '全部', value: 'ALL' },
              { label: categoryMeta.infrastructure.label, value: 'infrastructure' },
              { label: categoryMeta.business.label, value: 'business' },
              { label: categoryMeta.operations.label, value: 'operations' },
              { label: categoryMeta.automation.label, value: 'automation' },
              { label: categoryMeta.custom.label, value: 'custom' },
            ]}
          />
          <Tooltip title="重新整理">
            <Button icon={<ReloadOutlined />} onClick={refresh} disabled={loading} />
          </Tooltip>
        </Space>
      }
    />
  );

  const tabItems: TabsProps['items'] = useMemo(() => ([
    {
      key: 'overview',
      label: '概覽',
      children: overviewContent,
    },
    {
      key: 'library',
      label: '儀表板列表',
      children: libraryContent,
    },
  ]), [libraryContent, overviewContent]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title="儀表板管理"
        subtitle="統一管理基礎設施與業務儀表板"
        description="建立、分享與治理所有 SRE 儀表板，確保視覺一致性與數據可靠性。"
        extra={
          <Space>
            <Tooltip title="重新整理儀表板資料">
              <Button icon={<ReloadOutlined />} onClick={refresh} disabled={loading} />
            </Tooltip>
            <Button type="primary" icon={<AppstoreOutlined />}>
              新建儀表板
            </Button>
          </Space>
        }
      />

      {isFallback && (
        <Alert
          showIcon
          type="info"
          message="目前顯示為內建模擬資料"
          description="尚未連接到 /dashboards API，以下內容為範例數據。"
        />
      )}

      {error && !isFallback && (
        <Alert
          type="error"
          showIcon
          message="載入儀表板資料失敗"
          description={error instanceof Error ? error.message : '請稍後再試'}
        />
      )}

      <Row gutter={[16, 16]}>
        {kpiCards.map((card) => (
          <Col key={card.key} xs={24} sm={12} xl={6}>
            <ContextualKPICard
              title={card.title}
              value={card.value}
              unit={card.unit}
              status={card.status}
              description={card.description}
              icon={card.icon}
              loading={loading}
            />
          </Col>
        ))}
      </Row>

      <Spin spinning={loading && dashboards.length === 0} tip="載入儀表板資料中...">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Spin>
    </Space>
  );
};

export default DashboardAdministrationPage;
