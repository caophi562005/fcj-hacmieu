import { AppConfiguration } from '@common/configurations/app.config';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proactive refresh middleware (Next 16 `proxy.ts`).
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
const ID_TOKEN_COOKIE = 'id_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_THRESHOLD_SECONDS = 5 * 60;

const BFF_BASE_URL = AppConfiguration.SELLER_BFF_URL;

type RefreshResponse = {
  data?: {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
};

type AccessTokenPayload = {
  exp?: number;
  'cognito:groups'?: string[];
};

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as AccessTokenPayload;
  } catch {
    return null;
  }
}

async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn: number;
} | null> {
  if (!BFF_BASE_URL) return null;
  try {
    const r = await fetch(`${BFF_BASE_URL}/iam/auth/refresh`, {
      method: 'POST',
      headers: {
        'x-refresh-token': refreshToken,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!r.ok) return null;

    const body = (await r.json()) as RefreshResponse;
    const data = body?.data;
    if (!data?.accessToken) return null;

    return {
      accessToken: data.accessToken,
      idToken: data.idToken,
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

  if (!accessToken) return NextResponse.next();

  const payload = decodeJwtPayload(accessToken);
  const exp = payload?.exp;
  if (!exp) return NextResponse.next();

  const nowSec = Math.floor(Date.now() / 1000);
  const remaining = exp - nowSec;
  const hasSellerGroup = payload?.['cognito:groups']?.includes('SELLER') ?? false;

  // A seller can be approved after the current access token was issued.
  // Refresh immediately when the token does not yet contain SELLER so the
  // new Cognito group/merchant claims are picked up without waiting for expiry.
  if (remaining > REFRESH_THRESHOLD_SECONDS && hasSellerGroup) {
    return NextResponse.next();
  }

  if (!refreshToken) return NextResponse.next();

  const tokens = await refreshTokens(refreshToken);
  if (!tokens) {
    const res = NextResponse.next();
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(ID_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    return res;
  }

  const requestHeaders = new Headers(req.headers);
  const cookieHeader = requestHeaders.get('cookie') ?? '';
  let updatedCookie = upsertCookieHeader(
    cookieHeader,
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
  );
  if (tokens.idToken) {
    updatedCookie = upsertCookieHeader(
      updatedCookie,
      ID_TOKEN_COOKIE,
      tokens.idToken,
    );
  }
  requestHeaders.set('cookie', updatedCookie);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  const isProd = process.env.NODE_ENV === 'production';

  res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expiresIn,
    secure: isProd,
  });

  if (tokens.idToken) {
    res.cookies.set(ID_TOKEN_COOKIE, tokens.idToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expiresIn,
      secure: isProd,
    });
  }

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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
