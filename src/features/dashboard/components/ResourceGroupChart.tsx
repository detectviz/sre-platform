import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Spin } from 'antd';
import { ResourceDistribution } from '../../../services/api-client';

interface ResourceGroupChartProps {
  chartData: ResourceDistribution['by_group'];
  loading?: boolean;
}

/**
 * 儀表板上的 "資源群組狀態總覽" 長條圖。
 */
const ResourceGroupChart: React.FC<ResourceGroupChartProps> = ({ chartData, loading }) => {
  if (loading || !chartData) {
    return <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
  }

  const getOption = () => {
    // 從 chartData 中提取圖表需要的標籤和數據系列
    const groupNames = chartData.map(item => item.group_name);
    const healthyData = chartData.map(item => item.healthy);
    const warningData = chartData.map(item => item.warning);
    const criticalData = chartData.map(item => item.critical);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['正常', '警告', '異常'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: groupNames,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '正常',
          type: 'bar',
          stack: '總數',
          data: healthyData,
          color: '#52c41a', // 綠色
        },
        {
          name: '警告',
          type: 'bar',
          stack: '總數',
          data: warningData,
          color: '#faad14', // 黃色
        },
        {
          name: '異常',
          type: 'bar',
          stack: '總數',
          data: criticalData,
          color: '#f5222d', // 紅色
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height: 300 }} />;
};

export default ResourceGroupChart;
