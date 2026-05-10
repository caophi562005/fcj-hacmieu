import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '../../../../../lib/auth';
import { AdminWebConfig } from '../../../../../lib/config';
import { getOidcClient } from '../../../../../lib/oidc';

/**
 * GET /api/auth/callback/cognito
 *
 * Cognito redirect về đây sau khi user đăng nhập, kèm:
 *   ?code=<authorization_code>&state=<state>
 *
 *   1. Đọc state từ URL + state đã lưu trong cookie → so sánh (chống CSRF)
 *   2. Lấy nonce từ cookie để verify ID token
 *   3. client.callback(...) đổi code lấy tokenSet
 *   4. Set cookie access_token / id_token / refresh_token httpOnly
 *   5. Cleanup oidc_nonce + oidc_state
 *   6. Redirect về `/` (Dashboard) — Header gọi getAuth() lấy info user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const appUrl = AdminWebConfig.webUrl();

  const error = searchParams.get('error');
  if (error) {
    console.error('[admin-web OIDC] Cognito error:', error);
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(error)}`,
    );
  }

  const cookieJar = request.cookies;
  const cookieNonce = cookieJar.get('oidc_nonce')?.value;
  const cookieState = cookieJar.get('oidc_state')?.value;

  if (!cookieNonce || !cookieState) {
    console.error('[admin-web OIDC] Missing nonce/state cookie — expired?');
    return NextResponse.redirect(`${appUrl}/?auth_error=session_expired`);
  }

  try {
    const client = await getOidcClient();
    const params = client.callbackParams(request.url);

    const tokenSet = await client.callback(
      AdminWebConfig.redirectUri(),
      params,
      { nonce: cookieNonce, state: cookieState },
    );

    if (!tokenSet.access_token) {
      throw new Error('No access_token returned from token endpoint');
    }

    const expiresIn = tokenSet.expires_in ?? 3600;
    const isProd = process.env.NODE_ENV === 'production';

    const res = NextResponse.redirect(`${appUrl}/`);

    res.cookies.set(ACCESS_TOKEN_COOKIE, tokenSet.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
      secure: isProd,
    });

    if (tokenSet.id_token) {
      res.cookies.set('id_token', tokenSet.id_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
        secure: isProd,
      });
    }

    if (tokenSet.refresh_token) {
      res.cookies.set('refresh_token', tokenSet.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: isProd,
      });
    }

    res.cookies.delete('oidc_nonce');
    res.cookies.delete('oidc_state');

    return res;
  } catch (err) {
    console.error('[admin-web OIDC] Token exchange failed:', err);
    return NextResponse.redirect(`${appUrl}/?auth_error=callback_failed`);
  }
}
