import { useMemo, useRef, useEffect } from 'react';
import { Space, Typography, Tooltip, Button, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import type { ResourceTopologyGraph } from '../../types/resources';

const { Title } = Typography;

type ResourceTopologyTabProps = {
  topology: ResourceTopologyGraph;
  loading: boolean;
  error: unknown;
  onRefresh: () => void;
  themeMode?: 'light' | 'dark';
};

export const ResourceTopologyTab = ({ topology, loading, error, onRefresh, themeMode }: ResourceTopologyTabProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const colors = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      label: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      node: {
        HEALTHY: isDark ? '#52c41a' : '#b7eb8f',
        WARNING: isDark ? '#faad14' : '#ffe58f',
        CRITICAL: isDark ? '#f5222d' : '#ffccc7',
        UNKNOWN: isDark ? '#4096ff' : '#91caff',
        MAINTENANCE: isDark ? '#8c8c8c' : '#d9d9d9',
        SILENCED: isDark ? '#597ef7' : '#adc6ff',
      },
      link: {
        HEALTHY: isDark ? 'rgba(82, 196, 26, 0.5)' : 'rgba(183, 235, 143, 0.8)',
        WARNING: isDark ? 'rgba(250, 173, 20, 0.5)' : 'rgba(255, 229, 143, 0.8)',
        CRITICAL: isDark ? 'rgba(245, 34, 45, 0.6)' : 'rgba(255, 204, 199, 0.9)',
        UNKNOWN: isDark ? 'rgba(64, 150, 255, 0.4)' : 'rgba(145, 202, 255, 0.7)',
        MAINTENANCE: isDark ? 'rgba(140, 140, 140, 0.4)' : 'rgba(217, 217, 217, 0.7)',
        SILENCED: isDark ? 'rgba(89, 126, 247, 0.4)' : 'rgba(173, 198, 255, 0.7)',
      },
    };
  }, [themeMode]);

  useEffect(() => {
    if (!chartContainerRef.current || loading) {
      return;
    }

    const chart = echarts.init(chartContainerRef.current);
    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const node = params.data as { name: string; status?: string; region?: string };
            return `${node.name}<br/>狀態：${node.status ?? '未知'}${node.region ? `<br/>位置：${node.region}` : ''}`;
          }
          if (params.dataType === 'edge') {
            const edge = params.data as { relation?: string; latencyMs?: number };
            return `${edge.relation ?? '關聯'}${edge.latencyMs ? `<br/>延遲 ${edge.latencyMs} ms` : ''}`;
          }
          return '';
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          emphasis: { focus: 'adjacency' },
          draggable: true,
          label: { show: true, color: colors.label, position: 'right' },
          data: topology.nodes.map((node) => ({
            id: node.id,
            name: node.name,
            category: node.type,
            status: node.status,
            region: node.region,
            value: node.importance ?? 1,
            symbolSize: 30 + Math.min(node.importance ?? 0, 5) * 5,
            itemStyle: {
              color: colors.node[node.status ?? 'UNKNOWN'] ?? colors.node.UNKNOWN,
            },
          })),
          links: topology.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            relation: edge.relation,
            latencyMs: edge.latencyMs,
            lineStyle: {
              color: colors.link[edge.status ?? 'UNKNOWN'] ?? colors.link.UNKNOWN,
              width: edge.status === 'CRITICAL' ? 2.5 : 1.5,
            },
          })),
          force: {
            repulsion: 350,
            gravity: 0.05,
            edgeLength: [80, 200],
          },
        },
      ],
    };

    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(chartContainerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [loading, topology, colors]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>資源拓撲</Title>
        <Tooltip title="重新整理拓撲圖">
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
        </Tooltip>
      </Space>

      {Boolean(error) && !loading && (
        <Alert type="error" showIcon message="無法載入拓撲圖" description={error instanceof Error ? error.message : '請稍後再試'} />
      )}

      <div
        ref={chartContainerRef}
        style={{ width: '100%', height: 520, background: 'var(--sre-container-bg-color-glass)', borderRadius: 12 }}
      >
        {loading && (
          <Space style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <Spin tip="正在計算拓撲圖..." />
          </Space>
        )}
      </div>
    </Space>
  );
};
