'use client';

import { ConvexClientProvider } from '@common/convex/index';
import type { ReactNode } from 'react';

export function SellerConvexProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return <>{children}</>;
  return (
    <ConvexClientProvider convexUrl={url}>{children}</ConvexClientProvider>
  );
}
