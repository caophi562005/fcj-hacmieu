import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from './constants';

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get(ACCESS_TOKEN_COOKIE)?.value);
}

export function withCacheBust(url: string, version: unknown): string {
  if (!url) return url;
  if (!version) return url;
  const v = new Date(String(version)).getTime();
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${v}`;
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
