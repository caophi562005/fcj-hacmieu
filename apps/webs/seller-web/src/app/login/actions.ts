'use server';

import { AuthConfiguration } from '@common/configurations/auth.config';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../../lib/iam';

export async function logoutAction() {
  // Best-effort: xoá token cache ở backend (không block flow nếu fail)
  try {
    await logout();
  } catch {
    // ignore — token cache sẽ tự expire
  }

  const c = await cookies();
  c.delete('access_token');
  c.delete('id_token');
  c.delete('refresh_token');
  c.delete('oidc_nonce');
  c.delete('oidc_state');

  const url = new URL(`https://${AuthConfiguration.COGNITO_DOMAIN}/logout`);
  url.searchParams.set('client_id', AuthConfiguration.SELLER_CLIENT_ID);
  url.searchParams.set('logout_uri', AuthConfiguration.SELLER_LOGOUT_URI);

  redirect(url.toString());
}
