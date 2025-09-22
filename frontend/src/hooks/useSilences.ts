import { useState, useEffect, useCallback } from 'react';
import type { paths } from '../types/api';

// 從 openapi.yaml 生成的型別中獲取 Silence 型別並匯出
export type Silence = paths['/silences']['get']['responses']['200']['content']['application/json'][number];
const API_URL = 'http://localhost:8080/api/v1/silences';

/**
 * @description 管理靜音規則的自訂 Hook，包含完整的 CUD (Create, Update, Delete) 功能
 * @returns {object} 包含靜音規則、載入狀態、錯誤訊息以及操作函式的物件
 */
export const useSilences = () => {
  const [silences, setSilences] = useState<Silence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 獲取所有靜音規則
  const fetchSilences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('無法獲取靜音規則數據');
      }
      const data: Silence[] = await response.json();
      setSilences(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSilences();
  }, [fetchSilences]);

  // 新增靜音規則
  const addSilence = useCallback(async (newSilence: Partial<Silence>) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSilence),
    });
    if (!response.ok) {
      throw new Error('新增失敗');
    }
    fetchSilences(); // 重新獲取列表
  }, [fetchSilences]);

  // 更新靜音規則
  const updateSilence = useCallback(async (id: string, updatedSilence: Partial<Silence>) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSilence),
    });
    if (!response.ok) {
      throw new Error('更新失敗');
    }
    fetchSilences(); // 重新獲取列表
  }, [fetchSilences]);

  // 刪除靜音規則
  const deleteSilence = useCallback(async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('刪除失敗');
    }
    fetchSilences(); // 重新獲取列表
  }, [fetchSilences]);


  return { silences, loading, error, addSilence, updateSilence, deleteSilence };
};
