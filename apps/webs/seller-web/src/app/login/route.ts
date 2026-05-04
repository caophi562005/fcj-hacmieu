import { NextResponse } from 'next/server';
import { generators } from 'openid-client';
import { getOidcClient } from '../../lib/oidc';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 10,
};

export async function GET() {
  const client = await getOidcClient();

  const nonce = generators.nonce();
  const state = generators.state();

  const authUrl = client.authorizationUrl({
    scope: 'aws.cognito.signin.user.admin email openid phone',
    state,
    nonce,
  });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set('oidc_nonce', nonce, COOKIE_OPTS);
  res.cookies.set('oidc_state', state, COOKIE_OPTS);
  return res;
}
