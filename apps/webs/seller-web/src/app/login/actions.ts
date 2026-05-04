'use server';

import { AuthConfiguration } from '@common/configurations/auth.config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN_COOKIE } from '../../lib/auth';
import { SellerWebConfig } from '../../lib/config';
import { logout } from '../../lib/iam';

export async function logoutAction() {
  try {
    await logout();
  } catch (error) {
    console.error('[seller-web logoutAction] BFF logout failed:', error);
  }

  const c = await cookies();
  c.delete(ACCESS_TOKEN_COOKIE);
  c.delete('id_token');
  c.delete('refresh_token');
  c.delete('oidc_nonce');
  c.delete('oidc_state');

  const url = new URL(`https://${AuthConfiguration.COGNITO_DOMAIN}/logout`);
  url.searchParams.set('client_id', AuthConfiguration.CLIENT_ID);
  url.searchParams.set('logout_uri', SellerWebConfig.logoutUri());

  redirect(url.toString());
}
