'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useMemo, type ReactNode } from 'react';

export function ConvexClientProvider({
  convexUrl,
  children,
}: {
  convexUrl: string;
  children: ReactNode;
}) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
