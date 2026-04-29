import { GenderType } from '@common/constants/user.constant';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getCurrentUser } from './iam';

export const ACCESS_TOKEN_COOKIE = 'access_token';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: GenderType;
  birthday: string;
  vXu: number;
  vouchers: number;
};

const DEFAULT_AVATAR = 'https://i.pravatar.cc/200?img=12';

// Convert backend birthday (Date | ISO string | null) to `yyyy-MM-dd` for <input type="date">.
function formatBirthday(raw: unknown): string {
  if (!raw) return '';
  const d = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// Avatar trên S3 dùng key cố định (`{userId}/avatar/avatar.{ext}`) nên URL không
// đổi sau khi user upload ảnh mới → browser memory-cache phục vụ ảnh cũ.
// Thêm query `?v={updatedAt-timestamp}` làm cache-busting: URL khác → bypass cache.
function withCacheBust(url: string, version: unknown): string {
  if (!url) return url;
  if (!version) return url;

  const v = new Date(String(version)).getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${v}`;
}

// Per-request memoization: nhiều server component (Header, Layout, Page)
// cùng gọi `getAuth()` trong 1 render → dedupe thành 1 BFF call duy nhất.
export const getAuth = cache(async (): Promise<MockUser | null> => {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.username ?? user.email?.split('@')[0] ?? 'Khách hàng',
    email: user.email ?? '',
    phone: user.phoneNumber ?? '',
    avatar: user.avatar
      ? withCacheBust(user.avatar, user.updatedAt)
      : DEFAULT_AVATAR,
    gender: user.gender,
    birthday: formatBirthday(user.birthday),
    vXu: 0,
    vouchers: 0,
  };
});

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get(ACCESS_TOKEN_COOKIE)?.value);
}
