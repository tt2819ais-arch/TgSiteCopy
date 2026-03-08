import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  direction?: 'top' | 'bottom';
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const {
    onLoadMore,
    hasMore,
    isLoading,
    threshold = 100,
    direction = 'bottom',
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loadingRef.current || !hasMore || isLoading) return;

    if (direction === 'bottom') {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadingRef.current = true;
        Promise.resolve(onLoadMore()).finally(() => {
          loadingRef.current = false;
        });
      }
    } else {
      if (container.scrollTop < threshold) {
        const prevScrollHeight = container.scrollHeight;
        loadingRef.current = true;

        Promise.resolve(onLoadMore()).finally(() => {
          loadingRef.current = false;
          // Сохранить позицию скролла
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - prevScrollHeight;
            }
          });
        });
      }
    }
  }, [onLoadMore, hasMore, isLoading, threshold, direction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { containerRef };
}

export default useInfiniteScroll;
