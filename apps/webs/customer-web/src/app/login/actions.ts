'use server';

import { AuthConfiguration } from '@common/configurations/auth.config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN_COOKIE } from '../../lib/auth';

export async function logoutAction() {
  const c = await cookies();
  c.delete(ACCESS_TOKEN_COOKIE);
  c.delete('refresh_token');
  c.delete('oidc_nonce');
  c.delete('oidc_state');

  const logoutUri = AuthConfiguration.LOGOUT_URI;

  const url = new URL(`https://${AuthConfiguration.COGNITO_DOMAIN}/logout`);
  url.searchParams.set('client_id', AuthConfiguration.CLIENT_ID);
  url.searchParams.set('logout_uri', logoutUri);

  redirect(url.toString());
}
