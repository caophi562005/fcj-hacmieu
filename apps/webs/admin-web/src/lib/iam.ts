import {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
} from '@common/web-core/lib/constants';
import {
  changePassword as _changePassword,
  getCurrentUser as _getCurrentUser,
  logout as _logout,
} from '@common/web-core/lib/iam';
import { cookies } from 'next/headers';
import { createApi, createServerApi } from './api';

export async function getCurrentUser() {
  const api = await createServerApi();
  return _getCurrentUser(api);
}

export async function changePassword(
  payload: Parameters<typeof _changePassword>[1],
) {
  const api = await createServerApi();
  return _changePassword(api, payload);
}

export async function logout() {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const idToken = c.get(ID_TOKEN_COOKIE)?.value ?? null;
  const api = createApi({ accessToken, idToken });
  return _logout(api);
}
