import { useState, useEffect } from 'react';
import type { paths } from '../types/api';

// 從生成的型別中提取我們需要的 Event 型別
type Event = paths['/events']['get']['responses']['200']['content']['application/json']['items'][number];

// 定義 Hook 的回傳型別
interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: Error | null;
}

/**
 * 取得事件列表的自定義 Hook
 *
 * @returns {UseEventsReturn} 包含事件資料、載入狀態和錯誤的物件
 */
export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // 這裡我們將呼叫 mock server
        const response = await fetch('http://localhost:8080/api/v1/events');
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
  }, []); // 空依賴陣列表示此 effect 只在元件掛載時執行一次

  return { events, loading, error };
};
