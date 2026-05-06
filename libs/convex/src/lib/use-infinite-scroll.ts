'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  status: 'CanLoadMore' | 'LoadingMore' | 'Exhausted' | 'LoadingFirstPage';
  loadMore: (numItems: number) => void;
  loadSize?: number;
  observerEnabled?: boolean;
}

export const LOAD_SIZE = 10;

/**
 * Hook IntersectionObserver: gắn `topElementRef` vào sentinel ở đầu/cuối
 * danh sách. Khi sentinel vào viewport sẽ gọi `loadMore`.
 */
export const useInfiniteScroll = ({
  status,
  loadMore,
  loadSize = LOAD_SIZE,
  observerEnabled = true,
}: UseInfiniteScrollProps) => {
  const topElementRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(() => {
    if (status === 'CanLoadMore') {
      loadMore(loadSize);
    }
  }, [status, loadMore, loadSize]);

  useEffect(() => {
    const topElement = topElementRef.current;
    if (!(topElement && observerEnabled)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(topElement);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, observerEnabled]);

  return {
    topElementRef,
    handleLoadMore,
    canLoadMore: status === 'CanLoadMore',
    isLoadingMore: status === 'LoadingMore',
    isExhausted: status === 'Exhausted',
    isLoadingFirstPage: status === 'LoadingFirstPage',
  };
};
