import { AppConfiguration } from '@common/configurations/app.config';
import { NextRequest } from 'next/server';

async function forward(request: NextRequest, method: 'GET' | 'POST') {
  const token = request.nextUrl.searchParams.get('token') || '';
  const response = await fetch(
    `${AppConfiguration.CUSTOMER_BFF_URL}/iam/marketing-preferences/unsubscribe?token=${encodeURIComponent(token)}`,
    { method, cache: 'no-store' },
  );
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') || 'text/html; charset=utf-8',
    },
  });
}

export function GET(request: NextRequest) {
  return forward(request, 'GET');
}

export function POST(request: NextRequest) {
  return forward(request, 'POST');
}
