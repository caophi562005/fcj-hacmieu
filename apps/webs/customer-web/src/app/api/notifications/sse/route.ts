import { AppConfiguration } from '@common/configurations/app.config';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '../../../../lib/auth';

// Next.js proxy SSE: EventSource ở browser không cho set Authorization header.
// Route này đọc cookie httpOnly, gắn Bearer rồi forward stream từ BFF về client.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cookieStore = request.cookies;
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const upstream = await fetch(
    `${AppConfiguration.CUSTOMER_BFF_URL}/utility/notification/sse`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'text/event-stream',
      },
      // Quan trọng: signal để khi client disconnect → fetch upstream cũng abort.
      signal: request.signal,
      cache: 'no-store',
    },
  );

  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream SSE error', { status: 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
