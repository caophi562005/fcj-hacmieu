import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';
import { AdminWebConfig } from './config';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const ID_TOKEN_COOKIE = 'id_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export type CreateApiOptions = {
  accessToken?: string | null;
  idToken?: string | null;
  cookie?: string | null;
};

function redirectToLoginIfClient() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
}

export function isUnauthorizedError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 401;
}

// Server-only helper: tự đọc httpOnly cookie `access_token` rồi tạo axios kèm Bearer.
// Dùng trong server components / server actions / route handlers.
export async function createServerApi(): Promise<AxiosInstance> {
  const c = await cookies();
  const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const idToken = c.get(ID_TOKEN_COOKIE)?.value ?? null;
  const instance = createApi({ accessToken, idToken });

  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err?.response?.status === 401) {
        const { redirect } = await import('next/navigation');
        redirect('/login');
      }

      return Promise.reject(err);
    },
  );

  return instance;
}

export function createApi(options: CreateApiOptions = {}): AxiosInstance {
  const { accessToken, idToken, cookie } = options;

  const config: AxiosRequestConfig = {
    baseURL: AdminWebConfig.bffUrl(),
    timeout: 10_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (accessToken) {
    config.headers!.Authorization = `Bearer ${accessToken}`;
  }
  if (idToken) {
    config.headers!['x-id-token'] = idToken;
  }
  if (cookie) {
    config.headers!.Cookie = cookie;
    config.withCredentials = true;
  }

  const instance = axios.create(config);

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      if (status === 401) {
        redirectToLoginIfClient();
        return Promise.reject(err);
      }

      const method = err?.config?.method?.toUpperCase();
      const url = err?.config?.url;
      const data = err?.response?.data;
      const code = err?.code;
      console.error(
        `[Admin BFF] ${method ?? '?'} ${url} → ${status ?? code ?? 'ERR'}`,
        data ?? err.message,
      );
      return Promise.reject(err);
    },
  );

  return instance;
}
