'use client';

import { ConvexClientProvider } from '@common/convex/index';
import type { ReactNode } from 'react';

export function CustomerConvexProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    // Fail-safe: render children mà không kết nối — các /chat trang gọi hooks
    // sẽ throw rõ ràng, dễ phát hiện thiếu env.
    return <>{children}</>;
  }
  return (
    <ConvexClientProvider convexUrl={url}>{children}</ConvexClientProvider>
  );
}
