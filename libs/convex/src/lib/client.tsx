'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useEffect, useMemo, type ReactNode } from 'react';

export function ConvexClientProvider({
  convexUrl,
  children,
}: {
  convexUrl: string;
  children: ReactNode;
}) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  useEffect(() => {
    client.setAuth(async () => {
      const response = await fetch('/api/auth/convex-token', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { token?: string };
      return data.token ?? null;
    });
    return () => client.clearAuth();
  }, [client]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
