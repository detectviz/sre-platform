import { useState, useEffect } from 'react';
import type { paths } from '../types/api';

// 從生成的型別中提取我們需要的 Event 型別
type Event = paths['/events']['get']['responses']['200']['content']['application/json']['items'][number];

// 定義篩選條件的型別
export interface EventFilters {
  q?: string;
  status?: string;
  severity?: string;
}

// 定義 Hook 的回傳型別
interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: Error | null;
  filters: EventFilters;
  setFilters: React.Dispatch<React.SetStateAction<EventFilters>>;
}

/**
 * 取得事件列表的自定義 Hook，並支援篩選功能
 * @param initialFilters 初始篩選條件
 * @returns {UseEventsReturn} 包含事件資料、載入狀態、錯誤、篩選條件和設定篩選條件的函式
 */
export const useEvents = (initialFilters: EventFilters = {}): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<EventFilters>(initialFilters);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // 根據篩選條件建立查詢字串
        const params = new URLSearchParams();
        if (filters.q) {
          params.append('q', filters.q);
        }
        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.severity) {
          params.append('severity', filters.severity);
        }
        const queryString = params.toString();
        const url = `http://localhost:8080/api/v1/events${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('無法從伺服器取得事件資料');
        }
        const data: { items: Event[], total: number } = await response.json();
        setEvents(data.items);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('發生未知錯誤'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]); // 當篩選條件變更時，重新執行 effect

  return { events, loading, error, filters, setFilters };
};
