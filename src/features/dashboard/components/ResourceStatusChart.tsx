import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Spin } from 'antd';
import type { ResourceDistribution } from '../../../services/api-client';

interface ResourceStatusChartProps {
  chartData: ResourceDistribution['byStatus'];
  loading?: boolean;
}

/**
 * 儀表板上的 "資源狀態分佈" 圓餅圖。
 */
const ResourceStatusChart: React.FC<ResourceStatusChartProps> = ({ chartData, loading }) => {
  if (loading || !chartData) {
    return <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
  }

  const getOption = () => {
    const data = [
      { value: chartData?.healthy ?? 0, name: '正常', itemStyle: { color: '#52c41a' } },
      { value: chartData?.warning ?? 0, name: '警告', itemStyle: { color: '#faad14' } },
      { value: chartData?.critical ?? 0, name: '異常', itemStyle: { color: '#f5222d' } },
      { value: chartData?.unknown ?? 0, name: '未知', itemStyle: { color: '#bfbfbf' } },
    ].filter(item => item.value > 0); // 只顯示有數據的項目

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: data.map(item => item.name),
      },
      series: [
        {
          name: '資源狀態',
          type: 'pie',
          radius: ['50%', '70%'], // 製作成圓環圖 (donut chart)
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height: 300 }} />;
};

export default ResourceStatusChart;
