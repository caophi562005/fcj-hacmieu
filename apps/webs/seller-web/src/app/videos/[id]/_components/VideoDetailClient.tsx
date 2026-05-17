'use client';

import type { VideoResponse } from '@common/interfaces/models/utility';
import { formatCurrency } from '@common/web-core/lib/format';
import { VideoFeed, type ProductInfo } from '@common/web-ui/index';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
  video: VideoResponse;
};

export function VideoDetailClient({ video }: Props) {
  const router = useRouter();

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

  if (video.status !== 'READY' || !video.hlsUrl) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-ink-muted">
        Video chưa sẵn sàng để xem.
      </div>
    );
  }

  return (
    <VideoFeed
      videos={[
        {
          id: video.id,
          hlsUrl: video.hlsUrl,
          thumbnailUrl: video.thumbnailUrl,
          shopId: video.shopId,
          productId: video.productId,
          duration: video.duration,
        },
      ]}
      onClose={() => router.back()}
      onFetchProduct={fetchProduct}
      formatPrice={formatCurrency}
      buildProductHref={(id) => `/products/${id}`}
    />
  );
}
