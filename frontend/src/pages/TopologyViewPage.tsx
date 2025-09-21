import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Space,
  Typography,
  Tooltip,
  Switch,
  Input,
  Badge,
  Tag,
  Modal,
  Descriptions,
  Alert,
  Spin
} from 'antd';
import {
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { PageHeader } from '../components/PageHeader';
// Removed unused imports
import type { ECharts } from 'echarts';
import * as echarts from 'echarts';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface TopologyNode {
  id: string;
  name: string;
  type: 'server' | 'database' | 'service' | 'network' | 'container' | 'load_balancer';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  group: string;
  zone?: string;
  cpu?: number;
  memory?: number;
  connections?: number;
  metadata?: Record<string, any>;
}

interface TopologyLink {
  source: string;
  target: string;
  type: 'network' | 'dependency' | 'data_flow';
  status: 'active' | 'inactive' | 'error';
  bandwidth?: number;
  latency?: number;
  protocol?: string;
}

interface TopologyViewPageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const TopologyViewPage: React.FC<TopologyViewPageProps> = ({
  onNavigate
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('logical');
  const [selectedZone, setSelectedZone] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [nodeDetailVisible, setNodeDetailVisible] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // const { data: resources } = useResources();
  // const { data: resourceGroups } = useResourceGroups();

  // 模擬拓撲數據
  const topologyData = useMemo(() => {
    const nodes: TopologyNode[] = [
      // Load Balancers
      {
        id: 'lb-1',
        name: 'Main Load Balancer',
        type: 'load_balancer',
        status: 'healthy',
        group: 'frontend',
        zone: 'zone-a',
        connections: 1500,
        metadata: { ip: '10.0.1.10', port: '443' }
      },

      // Web Servers
      {
        id: 'web-1',
        name: 'Web Server 1',
        type: 'server',
        status: 'healthy',
        group: 'frontend',
        zone: 'zone-a',
        cpu: 45,
        memory: 67,
        connections: 250
      },
      {
        id: 'web-2',
        name: 'Web Server 2',
        type: 'server',
        status: 'warning',
        group: 'frontend',
        zone: 'zone-b',
        cpu: 78,
        memory: 82,
        connections: 320
      },

      // API Services
      {
        id: 'api-1',
        name: 'User API',
        type: 'service',
        status: 'healthy',
        group: 'backend',
        zone: 'zone-a',
        cpu: 55,
        memory: 70,
        connections: 180
      },
      {
        id: 'api-2',
        name: 'Order API',
        type: 'service',
        status: 'healthy',
        group: 'backend',
        zone: 'zone-b',
        cpu: 42,
        memory: 65,
        connections: 210
      },
      {
        id: 'api-3',
        name: 'Payment API',
        type: 'service',
        status: 'critical',
        group: 'backend',
        zone: 'zone-a',
        cpu: 90,
        memory: 95,
        connections: 50
      },

      // Databases
      {
        id: 'db-master',
        name: 'Primary Database',
        type: 'database',
        status: 'healthy',
        group: 'data',
        zone: 'zone-a',
        cpu: 65,
        memory: 78,
        connections: 45
      },
      {
        id: 'db-replica',
        name: 'Replica Database',
        type: 'database',
        status: 'healthy',
        group: 'data',
        zone: 'zone-b',
        cpu: 35,
        memory: 56,
        connections: 25
      },
      {
        id: 'cache-1',
        name: 'Redis Cache',
        type: 'database',
        status: 'healthy',
        group: 'cache',
        zone: 'zone-a',
        cpu: 25,
        memory: 45,
        connections: 150
      },

      // External Services
      {
        id: 'cdn-1',
        name: 'CDN Service',
        type: 'network',
        status: 'healthy',
        group: 'external',
        zone: 'global',
        connections: 2500
      },
      {
        id: 'monitoring',
        name: 'Monitoring Service',
        type: 'service',
        status: 'healthy',
        group: 'ops',
        zone: 'zone-a',
        cpu: 30,
        memory: 40,
        connections: 75
      }
    ];

    const links: TopologyLink[] = [
      // Frontend connections
      { source: 'cdn-1', target: 'lb-1', type: 'network', status: 'active', bandwidth: 1000, latency: 5 },
      { source: 'lb-1', target: 'web-1', type: 'network', status: 'active', bandwidth: 100, latency: 1 },
      { source: 'lb-1', target: 'web-2', type: 'network', status: 'active', bandwidth: 100, latency: 2 },

      // Backend API connections
      { source: 'web-1', target: 'api-1', type: 'dependency', status: 'active', latency: 3 },
      { source: 'web-1', target: 'api-2', type: 'dependency', status: 'active', latency: 4 },
      { source: 'web-2', target: 'api-1', type: 'dependency', status: 'active', latency: 3 },
      { source: 'web-2', target: 'api-2', type: 'dependency', status: 'active', latency: 5 },

      // Payment processing
      { source: 'api-2', target: 'api-3', type: 'dependency', status: 'error', latency: 15 },

      // Database connections
      { source: 'api-1', target: 'db-master', type: 'data_flow', status: 'active', latency: 2 },
      { source: 'api-2', target: 'db-master', type: 'data_flow', status: 'active', latency: 3 },
      { source: 'api-3', target: 'db-master', type: 'data_flow', status: 'active', latency: 8 },
      { source: 'db-master', target: 'db-replica', type: 'data_flow', status: 'active', latency: 1 },

      // Cache connections
      { source: 'api-1', target: 'cache-1', type: 'data_flow', status: 'active', latency: 1 },
      { source: 'api-2', target: 'cache-1', type: 'data_flow', status: 'active', latency: 1 },

      // Monitoring connections
      { source: 'monitoring', target: 'web-1', type: 'network', status: 'active', latency: 1 },
      { source: 'monitoring', target: 'web-2', type: 'network', status: 'active', latency: 1 },
      { source: 'monitoring', target: 'api-1', type: 'network', status: 'active', latency: 1 },
      { source: 'monitoring', target: 'api-2', type: 'network', status: 'active', latency: 1 },
      { source: 'monitoring', target: 'api-3', type: 'network', status: 'active', latency: 1 },
      { source: 'monitoring', target: 'db-master', type: 'network', status: 'active', latency: 1 },
    ];

    return { nodes, links };
  }, []);

  // 篩選數據
  const filteredData = useMemo(() => {
    let nodes = topologyData.nodes;
    let links = topologyData.links;

    // Zone 篩選
    if (selectedZone !== 'all') {
      nodes = nodes.filter(node => node.zone === selectedZone);
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    }

    // 類型篩選
    if (filterType !== 'all') {
      nodes = nodes.filter(node => node.type === filterType);
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    }

    // 搜尋篩選
    if (searchTerm) {
      nodes = nodes.filter(node =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.group.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const nodeIds = new Set(nodes.map(n => n.id));
      links = links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    }

    return { nodes, links };
  }, [topologyData, selectedZone, filterType, searchTerm]);

  // 取得節點圖標 (暫時未使用)
  // const getNodeIcon = (type: string) => {
  //   switch (type) {
  //     case 'server': return '🖥️';
  //     case 'database': return '🗄️';
  //     case 'service': return '⚙️';
  //     case 'network': return '🌐';
  //     case 'container': return '📦';
  //     case 'load_balancer': return '⚖️';
  //     default: return '⭕';
  //   }
  // };

  // 取得狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#52c41a';
      case 'warning': return '#faad14';
      case 'critical': return '#ff4d4f';
      case 'unknown': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };

  // 取得連線顏色
  const getLinkColor = (status: string) => {
    switch (status) {
      case 'active': return '#1890ff';
      case 'inactive': return '#d9d9d9';
      case 'error': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  // 初始化圖表
  const initChart = useCallback(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, 'dark');
    chartInstanceRef.current = chart;

    const option = {
      title: {
        text: selectedView === 'logical' ? '邏輯拓撲視圖' : selectedView === 'physical' ? '物理拓撲視圖' : '服務依賴視圖',
        left: 'center',
        textStyle: {
          color: 'var(--text-color)',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const node = params.data;
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 8px;">${node.name}</div>
                <div>類型: ${node.type}</div>
                <div>狀態: <span style="color: ${getStatusColor(node.status)}">${node.status}</span></div>
                <div>群組: ${node.group}</div>
                ${node.zone ? `<div>區域: ${node.zone}</div>` : ''}
                ${node.cpu ? `<div>CPU: ${node.cpu}%</div>` : ''}
                ${node.memory ? `<div>記憶體: ${node.memory}%</div>` : ''}
                ${node.connections ? `<div>連線數: ${node.connections}</div>` : ''}
              </div>
            `;
          } else {
            const link = params.data;
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 8px;">連線資訊</div>
                <div>來源: ${link.source}</div>
                <div>目標: ${link.target}</div>
                <div>類型: ${link.type}</div>
                <div>狀態: <span style="color: ${getLinkColor(link.status)}">${link.status}</span></div>
                ${link.latency ? `<div>延遲: ${link.latency}ms</div>` : ''}
                ${link.bandwidth ? `<div>頻寬: ${link.bandwidth}Mbps</div>` : ''}
              </div>
            `;
          }
        }
      },
      series: [{
        type: 'graph',
        layout: 'force',
        animation: true,
        label: {
          show: showLabels,
          position: 'bottom',
          formatter: '{b}',
          color: 'var(--text-color-secondary)',
          fontSize: 12
        },
        draggable: true,
        symbolSize: (_: any, params: any) => {
          const node = params.data;
          const baseSize = 40;
          const connectionFactor = (node.connections || 0) / 100;
          return Math.max(baseSize, baseSize + connectionFactor * 20);
        },
        symbol: () => {
          return 'circle';
        },
        itemStyle: {
          color: (params: any) => {
            return getStatusColor(params.data.status);
          },
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 2
        },
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3
          },
          lineStyle: {
            width: 3
          }
        },
        force: {
          repulsion: 2000,
          gravity: 0.2,
          edgeLength: [50, 200],
          layoutAnimation: true
        },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
        lineStyle: {
          opacity: showConnections ? 0.8 : 0.3,
          width: 2,
          curveness: 0.3,
          color: (params: any) => {
            return getLinkColor(params.data.status);
          }
        },
        data: filteredData.nodes.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          status: node.status,
          group: node.group,
          zone: node.zone,
          cpu: node.cpu,
          memory: node.memory,
          connections: node.connections,
          category: node.group,
          value: node.connections || 1
        })),
        links: filteredData.links.map(link => ({
          source: link.source,
          target: link.target,
          type: link.type,
          status: link.status,
          latency: link.latency,
          bandwidth: link.bandwidth
        })),
        categories: [
          { name: 'frontend', itemStyle: { color: '#1890ff' } },
          { name: 'backend', itemStyle: { color: '#52c41a' } },
          { name: 'data', itemStyle: { color: '#722ed1' } },
          { name: 'cache', itemStyle: { color: '#fa8c16' } },
          { name: 'external', itemStyle: { color: '#13c2c2' } },
          { name: 'ops', itemStyle: { color: '#eb2f96' } }
        ]
      }]
    };

    chart.setOption(option);

    // 節點點擊事件
    chart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        const node = filteredData.nodes.find(n => n.id === params.data.id);
        if (node) {
          setSelectedNode(node);
          setNodeDetailVisible(true);
        }
      }
    });

    // 響應式調整
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    setLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [filteredData, showLabels, showConnections, selectedView]);

  useEffect(() => {
    const cleanup = initChart();
    return cleanup;
  }, [initChart]);

  // 圖表操作函數
  const handleZoomIn = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispatchAction({
        type: 'dataZoom',
        start: 0,
        end: 50
      });
    }
  };

  const handleZoomOut = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispatchAction({
        type: 'dataZoom',
        start: 0,
        end: 100
      });
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      initChart();
    }, 1000);
  };

  const handleFullscreen = () => {
    if (chartRef.current) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
    }
  };

  // 統計信息
  const stats = useMemo(() => {
    const healthyNodes = filteredData.nodes.filter(n => n.status === 'healthy').length;
    const warningNodes = filteredData.nodes.filter(n => n.status === 'warning').length;
    const criticalNodes = filteredData.nodes.filter(n => n.status === 'critical').length;
    const activeLinks = filteredData.links.filter(l => l.status === 'active').length;
    const errorLinks = filteredData.links.filter(l => l.status === 'error').length;

    return {
      totalNodes: filteredData.nodes.length,
      totalLinks: filteredData.links.length,
      healthyNodes,
      warningNodes,
      criticalNodes,
      activeLinks,
      errorLinks
    };
  }, [filteredData]);

  return (
    <div className="topology-view-page">
      <PageHeader
        title="拓撲視圖"
        subtitle="系統架構與資源關係視覺化"
      />

      {/* 控制面板 */}
      <Card className="glass-surface" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Text strong>視圖類型:</Text>
              <Select
                value={selectedView}
                onChange={setSelectedView}
                style={{ width: 120 }}
              >
                <Option value="logical">邏輯視圖</Option>
                <Option value="physical">物理視圖</Option>
                <Option value="service">服務依賴</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Space>
              <Text strong>區域:</Text>
              <Select
                value={selectedZone}
                onChange={setSelectedZone}
                style={{ width: 100 }}
              >
                <Option value="all">全部</Option>
                <Option value="zone-a">Zone A</Option>
                <Option value="zone-b">Zone B</Option>
                <Option value="global">Global</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Space>
              <Text strong>類型:</Text>
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 100 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">全部</Option>
                <Option value="server">伺服器</Option>
                <Option value="database">資料庫</Option>
                <Option value="service">服務</Option>
                <Option value="network">網路</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="搜尋節點..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={4}>
            <Space>
              <Tooltip title="顯示標籤">
                <Switch
                  checked={showLabels}
                  onChange={setShowLabels}
                  size="small"
                />
              </Tooltip>
              <Text>標籤</Text>
              <Tooltip title="顯示連線">
                <Switch
                  checked={showConnections}
                  onChange={setShowConnections}
                  size="small"
                />
              </Tooltip>
              <Text>連線</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 統計面板 */}
        <Col xs={24} lg={6}>
          <Card className="glass-surface" title="拓撲統計" style={{ height: 'calc(100vh - 280px)' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* 節點統計 */}
              <div>
                <Title level={5}>節點狀態</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>總計:</span>
                    <Badge count={stats.totalNodes} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>健康:</span>
                    <Badge count={stats.healthyNodes} style={{ backgroundColor: '#52c41a' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>警告:</span>
                    <Badge count={stats.warningNodes} style={{ backgroundColor: '#faad14' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>嚴重:</span>
                    <Badge count={stats.criticalNodes} style={{ backgroundColor: '#ff4d4f' }} />
                  </div>
                </Space>
              </div>

              {/* 連線統計 */}
              <div>
                <Title level={5}>連線狀態</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>總計:</span>
                    <Badge count={stats.totalLinks} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>活躍:</span>
                    <Badge count={stats.activeLinks} style={{ backgroundColor: '#52c41a' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>錯誤:</span>
                    <Badge count={stats.errorLinks} style={{ backgroundColor: '#ff4d4f' }} />
                  </div>
                </Space>
              </div>

              {/* 圖表控制 */}
              <div>
                <Title level={5}>圖表控制</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button icon={<ZoomInOutlined />} block onClick={handleZoomIn}>
                    放大
                  </Button>
                  <Button icon={<ZoomOutOutlined />} block onClick={handleZoomOut}>
                    縮小
                  </Button>
                  <Button icon={<ReloadOutlined />} block onClick={handleRefresh}>
                    重新整理
                  </Button>
                  <Button icon={<FullscreenOutlined />} block onClick={handleFullscreen}>
                    全螢幕
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 拓撲圖表 */}
        <Col xs={24} lg={18}>
          <Card className="glass-surface" style={{ height: 'calc(100vh - 280px)' }}>
            <Spin spinning={loading} tip="載入拓撲圖表...">
              <div
                ref={chartRef}
                style={{
                  width: '100%',
                  height: 'calc(100vh - 360px)',
                  minHeight: '500px'
                }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 節點詳情彈窗 */}
      <Modal
        title={selectedNode ? `${selectedNode.name} - 詳細資訊` : '節點詳情'}
        visible={nodeDetailVisible}
        onCancel={() => setNodeDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNodeDetailVisible(false)}>
            關閉
          </Button>,
          selectedNode && (
            <Button
              key="navigate"
              type="primary"
              onClick={() => {
                onNavigate?.('resources', {
                  type: selectedNode.type,
                  id: selectedNode.id
                });
                setNodeDetailVisible(false);
              }}
            >
              查看詳情
            </Button>
          )
        ]}
        width={600}
      >
        {selectedNode && (
          <div>
            <Alert
              message={`狀態: ${selectedNode.status}`}
              type={selectedNode.status === 'healthy' ? 'success' :
                selectedNode.status === 'warning' ? 'warning' : 'error'}
              style={{ marginBottom: 16 }}
            />

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="節點名稱">{selectedNode.name}</Descriptions.Item>
              <Descriptions.Item label="節點類型">
                <Tag color="blue">{selectedNode.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="資源群組">
                <Tag color="green">{selectedNode.group}</Tag>
              </Descriptions.Item>
              {selectedNode.zone && (
                <Descriptions.Item label="可用區域">
                  <Tag color="orange">{selectedNode.zone}</Tag>
                </Descriptions.Item>
              )}
              {selectedNode.cpu && (
                <Descriptions.Item label="CPU 使用率">
                  <span style={{ color: selectedNode.cpu > 80 ? '#ff4d4f' : '#52c41a' }}>
                    {selectedNode.cpu}%
                  </span>
                </Descriptions.Item>
              )}
              {selectedNode.memory && (
                <Descriptions.Item label="記憶體使用率">
                  <span style={{ color: selectedNode.memory > 80 ? '#ff4d4f' : '#52c41a' }}>
                    {selectedNode.memory}%
                  </span>
                </Descriptions.Item>
              )}
              {selectedNode.connections && (
                <Descriptions.Item label="連線數">{selectedNode.connections}</Descriptions.Item>
              )}
              {selectedNode.metadata?.ip && (
                <Descriptions.Item label="IP 地址">{selectedNode.metadata.ip}</Descriptions.Item>
              )}
              {selectedNode.metadata?.port && (
                <Descriptions.Item label="端口">{selectedNode.metadata.port}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TopologyViewPage;