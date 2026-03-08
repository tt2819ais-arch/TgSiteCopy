import { useState, useEffect, useRef, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: unknown[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

export default useDebounce;
