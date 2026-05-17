'use client';

import type { VideoResponse } from '@common/interfaces/models/utility';
import { formatCurrency } from '@common/web-core/lib/format';
import {
  VideoFeed,
  type ProductInfo,
  type VideoFeedItem,
} from '@common/web-ui/index';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

type Props = {
  initialVideos: VideoResponse[];
};

export function VideoFeedClient({ initialVideos }: Props) {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoFeedItem[]>(
    initialVideos
      .filter((v) => v.hlsUrl)
      .map((v) => ({
        id: v.id,
        hlsUrl: v.hlsUrl!,
        thumbnailUrl: v.thumbnailUrl,
        shopId: v.shopId,
        productId: v.productId,
        duration: v.duration,
      })),
  );
  const loadingRef = useRef(false);

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const excludeIds = videos.map((v) => v.id);
      const res = await fetch('/api/video-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5, excludeIds }),
      });
      const data = await res.json();
      const newVideos: VideoFeedItem[] = (data.videos ?? [])
        .filter((v: any) => v.hlsUrl)
        .map((v: any) => ({
          id: v.id,
          hlsUrl: v.hlsUrl,
          thumbnailUrl: v.thumbnailUrl,
          shopId: v.shopId,
          productId: v.productId,
          duration: v.duration,
        }));

      if (newVideos.length > 0) {
        setVideos((prev) => [...prev, ...newVideos]);
      }
    } catch (err) {
      console.error('[VideoFeed] Load more failed:', err);
    } finally {
      loadingRef.current = false;
    }
  }, [videos]);

  const fetchProduct = useCallback(
    async (productId: string): Promise<ProductInfo | null> => {
      try {
        const res = await fetch(`/api/product/${productId}`);
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    [],
  );

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-ink-muted">
        Chưa có video nào.
      </div>
    );
  }

  return (
    <VideoFeed
      videos={videos}
      onClose={() => router.back()}
      onLoadMore={handleLoadMore}
      onFetchProduct={fetchProduct}
      formatPrice={formatCurrency}
      buildProductHref={(id) => `/product/${id}`}
      onVideoChange={(video) => {
        window.history.replaceState(null, '', `/videos/${video.id}`);
      }}
    />
  );
}
