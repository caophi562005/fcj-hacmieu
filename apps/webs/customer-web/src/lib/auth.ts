import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'vshop_auth';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  address: string;
  vXu: number;
  vouchers: number;
  membership: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim cương';
};

export const MOCK_USER: MockUser = {
  id: 'u1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.vn',
  phone: '+84 901 234 567',
  avatar: 'https://i.pravatar.cc/200?img=12',
  gender: 'male',
  birthday: '1995-08-15',
  address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  vXu: 2450,
  vouchers: 8,
  membership: 'Vàng',
};

export async function getAuth(): Promise<MockUser | null> {
  const c = await cookies();
  const has = c.get(AUTH_COOKIE)?.value;
  return has ? MOCK_USER : null;
}

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get(AUTH_COOKIE)?.value);
}
