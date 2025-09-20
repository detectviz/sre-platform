import { useMemo, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { Spin } from 'antd';

type ForecastChartProps = {
  title: string;
  data: {
    dates: string[];
    usage: number[];
    forecast: number[];
    limit: number;
  };
  loading: boolean;
  themeMode?: 'light' | 'dark';
};

export const ForecastChart = ({ title, data, loading, themeMode = 'dark' }: ForecastChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  const colors = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      text: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
      line: isDark ? '#3876c4' : '#5b9bd5',
      forecastLine: isDark ? '#8a8a8a' : '#c9c9c9',
      area: isDark ? 'rgba(56, 118, 196, 0.3)' : 'rgba(91, 155, 213, 0.2)',
      limitLine: isDark ? '#f5222d' : '#ff4d4f',
      tooltipBg: isDark ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      axisLine: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    };
  }, [themeMode]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = echarts.init(chartContainerRef.current, themeMode === 'dark' ? 'dark' : 'light');

    if (loading || !data) {
      chart.showLoading();
      return;
    }
    chart.hideLoading();

    const option: EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: colors.text,
          fontWeight: 'normal',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.axisLine,
        textStyle: {
          color: colors.text,
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          let content = `${date}<br/>`;
          params.forEach((item: any) => {
            if (item.value !== undefined && item.value !== null) {
              content += `${item.marker} ${item.seriesName}: ${item.value.toFixed(1)}%<br/>`;
            }
          });
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.dates,
        axisLine: { lineStyle: { color: colors.axisLine } },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: colors.axisLine, type: 'dashed' } },
      },
      series: [
        {
          name: '實際用量',
          type: 'line',
          data: data.usage,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: colors.line,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.area },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ]),
          },
        },
        {
          name: '預測用量',
          type: 'line',
          data: [...new Array(data.usage.length - 1).fill(null), data.usage[data.usage.length - 1], ...data.forecast],
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
            type: 'dashed',
            color: colors.forecastLine,
          },
        },
        {
          name: '容量閾值',
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            data: [{
              yAxis: data.limit,
              lineStyle: {
                width: 2,
                type: 'dashed',
                color: colors.limitLine,
              },
              label: {
                show: true,
                formatter: '{b}: {c}%',
                position: 'end',
                color: colors.limitLine,
              },
            }],
            label: {
              formatter: '{b}',
            },
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
  }, [loading, data, colors, title]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 350 }}>
      {loading && <Spin style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
