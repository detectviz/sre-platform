import { useState } from 'react';

export const useLocalStorage = <T,>(key: string, defaultValue: T): [T, (value: T) => void] => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  const initial = stored ? (JSON.parse(stored) as T) : defaultValue;
  const [state, setState] = useState<T>(initial);

  const updateState = (value: T) => {
    setState(value);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('無法寫入 localStorage', err);
    }
  };

  return [state, updateState];
};
