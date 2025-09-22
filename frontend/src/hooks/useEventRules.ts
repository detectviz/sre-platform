import { useState, useEffect } from 'react';
import type { paths } from '../types/api';

// 從生成的型別中提取 EventRule 型別
type EventRule = paths['/event-rules']['get']['responses']['200']['content']['application/json'][number];

// 定義 Hook 的回傳型別
interface UseEventRulesReturn {
  rules: EventRule[];
  loading: boolean;
  error: Error | null;
}

/**
 * 取得事件規則列表的自定義 Hook
 *
 * @returns {UseEventRulesReturn} 包含規則資料、載入狀態和錯誤的物件
 */
export const useEventRules = (): UseEventRulesReturn => {
  const [rules, setRules] = useState<EventRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEventRules = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/v1/event-rules');
        if (!response.ok) {
          throw new Error('無法從伺服器取得事件規則資料');
        }
        const data: EventRule[] = await response.json();
        setRules(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('發生未知錯誤'));
      } finally {
        setLoading(false);
      }
    };

    fetchEventRules();
  }, []);

  return { rules, loading, error };
};
