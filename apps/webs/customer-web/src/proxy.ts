import { AppConfiguration } from '@common/configurations/app.config';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proactive refresh middleware.
 *
 * Trước mỗi request đến Next, kiểm tra `access_token`:
 *   - Còn hạn > 5 phút → cho qua.
 *   - Sắp hết / đã hết và có `refresh_token` → gọi BFF /iam/auth/refresh
 *     để đổi token mới, set lại cookie, rồi cho request đi tiếp.
 *   - Không có refresh_token / refresh fail → cho qua (page tự redirect login).
 *
 * Chạy ở Edge Runtime → KHÔNG dùng được axios / Node-only API.
 * Chỉ fetch + Web Crypto + base64 atob.
 */

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_THRESHOLD_SECONDS = 5 * 60; // Refresh khi còn <5 phút

const BFF_BASE_URL = AppConfiguration.CUSTOMER_BFF_URL;

type RefreshResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
};

function decodeJwtExp(token: string): number | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
} | null> {
  try {
    const r = await fetch(`${BFF_BASE_URL}/iam/auth/refresh`, {
      method: 'POST',
      headers: {
        'x-refresh-token': refreshToken,
        'Content-Type': 'application/json',
      },
      // Edge fetch — không có cache mặc định
      cache: 'no-store',
    });

    if (!r.ok) return null;

    const body = (await r.json()) as RefreshResponse;
    const data = body?.data;
    if (!data?.accessToken) return null;

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn ?? 3600,
    };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Không có access_token → cho qua (page sẽ tự redirect login nếu cần)
  if (!accessToken) return NextResponse.next();

  const exp = decodeJwtExp(accessToken);
  if (!exp) return NextResponse.next();

  const nowSec = Math.floor(Date.now() / 1000);
  const remaining = exp - nowSec;

  // Còn hạn dài → cho qua
  if (remaining > REFRESH_THRESHOLD_SECONDS) {
    return NextResponse.next();
  }

  // Sắp / đã hết hạn nhưng không có refresh_token → cho qua, page tự xử lý
  if (!refreshToken) return NextResponse.next();

  const tokens = await refreshTokens(refreshToken);
  if (!tokens) {
    // Refresh fail (refresh_token cũng hết hạn / bị revoke).
    // Xoá cả 2 cookie để page redirect login lần sau.
    const res = NextResponse.next();
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  // Tạo response next() và inject cookie mới.
  // Quan trọng: phải update cả request headers để các server component
  // trong CHÍNH request này đọc được token mới.
  const requestHeaders = new Headers(req.headers);
  const cookieHeader = requestHeaders.get('cookie') ?? '';
  const updatedCookie = upsertCookieHeader(
    cookieHeader,
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
  );
  requestHeaders.set('cookie', updatedCookie);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const isProd = process.env.NODE_ENV === 'production';

  res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expiresIn,
    secure: isProd,
  });

  if (tokens.refreshToken) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: isProd,
    });
  }

  return res;
}

function upsertCookieHeader(
  cookieHeader: string,
  name: string,
  value: string,
): string {
  const parts = cookieHeader
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
  const filtered = parts.filter((p) => !p.startsWith(`${name}=`));
  filtered.push(`${name}=${value}`);
  return filtered.join('; ');
}

export const config = {
  // Skip Next internals + static files + chính route refresh / callback
  // để tránh loop hoặc làm chậm asset.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
