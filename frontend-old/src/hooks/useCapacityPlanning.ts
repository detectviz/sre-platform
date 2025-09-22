import { useState, useEffect } from 'react';

// --- Mock Data Generation ---

const generateSeries = (days: number, initial: number, trend: number, noise: number) => {
  const series = [];
  let value = initial;
  for (let i = 0; i < days; i++) {
    series.push(Math.max(0, Math.min(100, value + (Math.random() - 0.5) * noise)));
    value += trend + (Math.random() - 0.5) * (noise / 5);
  }
  return series;
};

const generateForecast = (series: number[], days: number, trend: number) => {
  const forecast = [];
  let lastValue = series[series.length - 1];
  for (let i = 0; i < days; i++) {
    forecast.push(Math.max(0, Math.min(100, lastValue + trend * (i + 1))));
  }
  return forecast;
};

const getDates = (days: number, forecastDays: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }).replace('/', '/'));
  }
  for (let i = 1; i <= forecastDays; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' }).replace('/', '/'));
  }
  return dates;
};

const MOCK_SERVICES = [
  { id: 'service-a', name: '核心 API 服務' },
  { id: 'service-b', name: '資料處理管線' },
  { id: 'service-c', name: '使用者認證系統' },
];

const generateMockData = () => {
  const historyDays = 30;
  const forecastDays = 14;

  const cpuUsage = generateSeries(historyDays, 40, 0.5, 10);
  const memoryUsage = generateSeries(historyDays, 60, 0.2, 5);
  const diskUsage = generateSeries(historyDays, 25, 0.8, 2);

  return {
    dates: getDates(historyDays, forecastDays),
    cpu: {
      usage: cpuUsage,
      forecast: generateForecast(cpuUsage, forecastDays, 0.55),
      limit: 80,
      recommendation: 'CPU 使用率預計在 12 天後達到 80% 閾值，建議擴容或優化。',
    },
    memory: {
      usage: memoryUsage,
      forecast: generateForecast(memoryUsage, forecastDays, 0.22),
      limit: 85,
      recommendation: '記憶體用量穩定，目前無需調整。',
    },
    disk: {
      usage: diskUsage,
      forecast: generateForecast(diskUsage, forecastDays, 0.9),
      limit: 90,
      recommendation: '磁碟空間預計在 9 天後達到 90% 閾值，請立即規劃擴容方案。',
    },
    capacityAnalysis: {
      currentLoad: 5800, // rps
      capacityLimit: 10000, // rps
      bottleneck: '資料庫 CPU',
      suggestions: [
        '將資料庫實例從 db.m5.large 升級到 db.m5.xlarge',
        '為讀取密集型查詢增加只讀副本',
        '優化索引 `idx_orders_on_created_at`',
      ],
    },
  };
};


export const useCapacityPlanning = (serviceId: string | null) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!serviceId) {
      setData(null);
      setLoading(false);
      return;
    }

    // Simulate API call
    const timer = setTimeout(() => {
      try {
        const mockData = generateMockData();
        setData(mockData);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [serviceId]);

  return {
    data,
    loading,
    error,
    services: MOCK_SERVICES,
    refresh: () => {
      // In a real app, this would re-trigger the API call
      setData(generateMockData());
    }
  };
};

export default useCapacityPlanning;
