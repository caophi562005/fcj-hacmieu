import { GroupValues } from '@common/constants/user.constant';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getUserById } from './admin-iam';
import { ACCESS_TOKEN_COOKIE } from './api';

export { ACCESS_TOKEN_COOKIE };

export type SellerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  group: string[];
  isAdmin: boolean;
};

const DEFAULT_AVATAR = 'https://i.pravatar.cc/200?img=12';

type AccessTokenPayload = {
  sub?: string;
  userId?: string;
  email?: string;
  username?: string;
  name?: string;
  picture?: string;
  avatar?: string;
  [key: string]: unknown;
};

function withCacheBust(url: string, version: unknown): string {
  if (!url) return url;
  if (!version) return url;
  const v = new Date(String(version)).getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${v}`;
}

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;

    const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object'
      ? (parsed as AccessTokenPayload)
      : null;
  } catch {
    return null;
  }
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

// Per-request memoization: nhiều server component cùng gọi `getAuth()` trong
// một render → dedupe thành 1 BFF call duy nhất.
export const getAuth = cache(async (): Promise<SellerUser | null> => {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  const tokenPayload = decodeJwtPayload(accessToken);
  const currentUserId = pickString(tokenPayload?.sub, tokenPayload?.userId);

  let user = null;
  if (currentUserId) {
    try {
      user = await getUserById(currentUserId);
    } catch {
      user = null;
    }
  }

  const email = pickString(user?.email, tokenPayload?.email) ?? '';
  const name =
    pickString(
      user?.username,
      tokenPayload?.name,
      tokenPayload?.username,
      tokenPayload?.['cognito:username'],
    ) ?? (email ? email.split('@')[0] : 'Tài khoản');
  const avatarRaw = pickString(
    user?.avatar,
    tokenPayload?.picture,
    tokenPayload?.avatar,
  );
  const avatar = avatarRaw
    ? withCacheBust(avatarRaw, user?.updatedAt)
    : DEFAULT_AVATAR;
  const group = Array.isArray(user?.group) ? [...user.group] : [];
  const isAdmin = group.includes(GroupValues.ADMIN);

  return {
    id: user?.id ?? currentUserId ?? '',
    name,
    email,
    phone: user?.phoneNumber ?? '',
    avatar,
    group,
    isAdmin,
  };
});

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get(ACCESS_TOKEN_COOKIE)?.value);
}
