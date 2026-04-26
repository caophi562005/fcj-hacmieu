'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE } from '../../lib/auth';

export async function loginAction(formData: FormData) {
  // Mock auth: accept any non-empty credentials.
  const id = String(formData.get('id') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!id || !password) {
    redirect('/login?error=missing');
  }
  const c = await cookies();
  c.set(AUTH_COOKIE, '1', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect('/profile');
}

export async function logoutAction() {
  const c = await cookies();
  c.delete(AUTH_COOKIE);
  redirect('/');
}
