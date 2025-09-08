// 檔案: src/features/CapacityPlanning/CapacityForecastChart.tsx
// 描述: 用於顯示容量預測趨勢的 ECharts 圖表元件。

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CapacityForecastResponse } from './types';

// 定義元件的 props 型別
interface CapacityForecastChartProps {
  // 從 API 獲取的預測資料
  data: CapacityForecastResponse;
  // 指標名稱，用於圖表標題
  metricName: string;
}

/**
 * 容量預測圖表元件
 * @param data - 預測資料
 * @param metricName - 指標名稱
 */
const CapacityForecastChart: React.FC<CapacityForecastChartProps> = ({ data, metricName }) => {
  // 從資料中解構出圖表需要的部份
  const { forecast_data, alert_threshold } = data;

  // 設定 ECharts 的選項
  const getOption = () => {
    return {
      // 圖表標題
      title: {
        text: `${metricName} 未來趨勢預測`,
        left: 'center',
      },
      // 提示框元件
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0];
          const date = new Date(point.axisValue).toLocaleDateString();
          const predicted = point.value.toFixed(2);
          const lower = params.find((p: any) => p.seriesName === '信賴區間下界').value.toFixed(2);
          const upper = params.find((p: any) => p.seriesName === '信賴區間上界').value.toFixed(2);
          return `${date}<br/>預測值: ${predicted}<br/>信賴區間: ${lower} - ${upper}`;
        }
      },
      // 圖例元件
      legend: {
        data: ['預測值', '信賴區間'],
        top: 30,
      },
      // X 軸設定
      xAxis: {
        type: 'time', // X 軸為時間類型
        data: forecast_data.map(item => item.timestamp),
      },
      // Y 軸設定
      yAxis: {
        type: 'value',
        name: '使用率 (%)', // Y 軸名稱
        min: 0, // Y 軸最小值
      },
      // 系列 (Series) 列表，每個系列對應一組資料
      series: [
        {
          name: '信賴區間下界',
          type: 'line',
          data: forecast_data.map(item => item.confidence_interval.lower),
          lineStyle: { opacity: 0 }, // 線條透明
          stack: 'confidence-band', // 與上界堆疊
          symbol: 'none', // 不顯示資料點符號
        },
        {
          name: '信賴區間上界',
          type: 'line',
          data: forecast_data.map(item => item.confidence_interval.upper),
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: '#ccc', // 區域填充顏色
            opacity: 0.3,
          },
          stack: 'confidence-band',
          symbol: 'none',
        },
        {
          name: '預測值',
          type: 'line',
          data: forecast_data.map(item => item.predicted_value),
          smooth: true, // 平滑曲線
          showSymbol: false, // 不顯示資料點符號
          lineStyle: {
            width: 3,
          },
        },
        {
          name: '警戒線',
          type: 'line',
          markLine: {
            silent: true, // 不觸發滑鼠事件
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: 'red',
            },
            data: [
              {
                yAxis: alert_threshold,
                label: {
                  formatter: `警戒線: ${alert_threshold}%`,
                  position: 'end',
                },
              },
            ],
          },
        },
      ],
    };
  };

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: '400px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default CapacityForecastChart;
