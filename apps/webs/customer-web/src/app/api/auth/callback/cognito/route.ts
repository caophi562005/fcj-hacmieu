import { AppConfiguration } from '@common/configurations/app.config';
import { AuthConfiguration } from '@common/configurations/auth.config';
import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '../../../../../lib/auth';
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
 *      (nội bộ: POST /oauth2/token, verify chữ ký id_token, verify nonce)
 *   4. Set cookie access_token httpOnly
 *   5. Cleanup oidc_nonce + oidc_state
 *   6. Redirect /profile
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const appUrl = AppConfiguration.CUSTOMER_WEB_URL;
  const error = searchParams.get('error');
  if (error) {
    console.error('[OIDC callback] Cognito error:', error);
    return NextResponse.redirect(
      `${appUrl}/?auth_error=${encodeURIComponent(error)}`,
    );
  }

  const cookieJar = request.cookies;
  const cookieNonce = cookieJar.get('oidc_nonce')?.value;
  const cookieState = cookieJar.get('oidc_state')?.value;

  if (!cookieNonce || !cookieState) {
    console.error(
      '[OIDC callback] Missing nonce/state cookie — session expired?',
    );
    return NextResponse.redirect(`${appUrl}/?auth_error=session_expired`);
  }

  try {
    const client = await getOidcClient();

    // openid-client v5: callbackParams nhận URL string hoặc query string
    const params = client.callbackParams(request.url);

    // Truyền state + nonce để lib tự verify (sẽ throw nếu mismatch).
    const tokenSet = await client.callback(
      AuthConfiguration.REDIRECT_URI,
      params,
      {
        nonce: cookieNonce,
        state: cookieState,
      },
    );

    if (!tokenSet.access_token) {
      throw new Error('No access_token returned from token endpoint');
    }

    // expires_in (giây) — fallback 1 giờ nếu Cognito không trả
    const expiresIn = tokenSet.expires_in ?? 3600;

    const res = NextResponse.redirect(`${appUrl}/profile`);

    // Set cookie access_token httpOnly để getAuth() đọc + forward Bearer cho BFF
    res.cookies.set(ACCESS_TOKEN_COOKIE, tokenSet.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
      secure: process.env.NODE_ENV === 'production',
    });

    if (tokenSet.refresh_token) {
      res.cookies.set('refresh_token', tokenSet.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Cleanup các cookie tạm dùng cho login flow
    res.cookies.delete('oidc_nonce');
    res.cookies.delete('oidc_state');

    return res;
  } catch (err) {
    console.error('[OIDC callback] Token exchange failed:', err);
    return NextResponse.redirect(`${appUrl}/?auth_error=callback_failed`);
  }
}
