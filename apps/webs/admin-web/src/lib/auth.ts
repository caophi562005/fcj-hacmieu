import { cookies } from 'next/headers';
import { cache } from 'react';
import { ACCESS_TOKEN_COOKIE } from './api';
import { getCurrentUser } from './iam';

export { ACCESS_TOKEN_COOKIE };

export type SellerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

const DEFAULT_AVATAR = 'https://i.pravatar.cc/200?img=12';

function withCacheBust(url: string, version: unknown): string {
  if (!url) return url;
  if (!version) return url;
  const v = new Date(String(version)).getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${v}`;
}

// Per-request memoization: nhiều server component cùng gọi `getAuth()` trong
// một render → dedupe thành 1 BFF call duy nhất.
export const getAuth = cache(async (): Promise<SellerUser | null> => {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.username ?? user.email?.split('@')[0] ?? 'Người bán',
    email: user.email ?? '',
    phone: user.phoneNumber ?? '',
    avatar: user.avatar
      ? withCacheBust(user.avatar, user.updatedAt)
      : DEFAULT_AVATAR,
  };
});

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get(ACCESS_TOKEN_COOKIE)?.value);
}
