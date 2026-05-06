'use client';

import type { Ref } from 'react';

interface InfiniteScrollTriggerProps {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
  noMoreText?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function InfiniteScrollTrigger({
  canLoadMore,
  isLoadingMore,
  onLoadMore,
  loadMoreText = 'Tải thêm',
  noMoreText = 'Đã hết',
  className,
  ref,
}: InfiniteScrollTriggerProps) {
  let text = loadMoreText;
  if (isLoadingMore) text = 'Đang tải...';
  else if (!canLoadMore) text = noMoreText;

  return (
    <div
      ref={ref}
      className={`flex w-full justify-center py-2 ${className ?? ''}`}
    >
      <button
        type="button"
        disabled={!canLoadMore || isLoadingMore}
        onClick={onLoadMore}
        className="text-xs text-ink-muted hover:text-primary transition-colors px-3 py-1 cursor-pointer disabled:cursor-default disabled:opacity-60"
      >
        {text}
      </button>
    </div>
  );
}
