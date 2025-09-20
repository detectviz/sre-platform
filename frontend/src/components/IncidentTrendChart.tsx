import { useEffect, useRef, useState } from 'react';
import { Card, Spin } from 'antd';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';

interface IncidentTrendData {
  date: string;
  total: number;
  critical: number;
  warning: number;
  resolved: number;
}

interface IncidentTrendChartProps {
  data?: IncidentTrendData[];
  loading?: boolean;
  height?: number;
  themeMode?: 'light' | 'dark';
}

const IncidentTrendChart = ({
  data = [],
  loading = false,
  height = 300,
  themeMode = 'dark'
}: IncidentTrendChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    const chart = echarts.init(chartRef.current, themeMode);
    chartInstanceRef.current = chart;

    // Define colors for dark theme
    const colors = {
      total: '#1890ff',
      critical: '#ff4d4f',
      warning: '#faad14',
      resolved: '#52c41a',
      text: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      axisLine: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      tooltipBg: themeMode === 'dark' ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    };

    if (loading || data.length === 0) {
      chart.showLoading({
        text: '載入事件趨勢資料...',
        color: colors.total,
        textColor: colors.text,
        maskColor: 'rgba(0, 0, 0, 0.3)',
      });
      return;
    }

    chart.hideLoading();

    const dates = data.map(item => dayjs(item.date).format('MM/DD'));

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.axisLine,
        textStyle: {
          color: colors.text,
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          let content = `日期：${date}<br/>`;
          params.forEach((item: any) => {
            content += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });
          return content;
        }
      },
      legend: {
        data: ['總事件', '嚴重', '警告', '已解決'],
        textStyle: {
          color: colors.text,
        },
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: { color: colors.axisLine }
        },
        axisLabel: {
          color: colors.text,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: { color: colors.axisLine }
        },
        axisLabel: {
          color: colors.text,
        },
        splitLine: {
          lineStyle: {
            color: colors.axisLine,
            type: 'dashed'
          }
        },
      },
      series: [
        {
          name: '總事件',
          type: 'line',
          data: data.map(item => item.total),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: colors.total,
          },
          itemStyle: {
            color: colors.total,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${colors.total}30` },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ]),
          },
        },
        {
          name: '嚴重',
          type: 'line',
          data: data.map(item => item.critical),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            width: 2,
            color: colors.critical,
          },
          itemStyle: {
            color: colors.critical,
          },
        },
        {
          name: '警告',
          type: 'line',
          data: data.map(item => item.warning),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            width: 2,
            color: colors.warning,
          },
          itemStyle: {
            color: colors.warning,
          },
        },
        {
          name: '已解決',
          type: 'line',
          data: data.map(item => item.resolved),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            width: 2,
            color: colors.resolved,
          },
          itemStyle: {
            color: colors.resolved,
          },
        },
      ],
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [data, loading, themeMode]);

  // Generate mock data if no data provided
  const mockData: IncidentTrendData[] = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
    const total = Math.floor(Math.random() * 20) + 10;
    const critical = Math.floor(total * 0.2);
    const warning = Math.floor(total * 0.3);
    const resolved = Math.floor(total * 0.8);

    return { date, total, critical, warning, resolved };
  });

  const chartData = data.length > 0 ? data : mockData;

  return (
    <Card
      className="glass-surface"
      title="事件趨勢 (近 7 天)"
      style={{ height: height + 100 }}
    >
      <div style={{ position: 'relative', height, width: '100%' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}>
            <Spin />
          </div>
        )}
        <div ref={chartRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </Card>
  );
};

export default IncidentTrendChart;