import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, ID_TOKEN_COOKIE } from './constants';

export type ApiFactoryConfig = {
  baseUrl: string;
  logPrefix?: string;
  onUnauthorized?: 'redirect' | 'ignore';
};

export type CreateApiOptions = {
  accessToken?: string | null;
  idToken?: string | null;
  cookie?: string | null;
};

export type ApiFactory = {
  createServerApi: () => Promise<AxiosInstance>;
  createApi: (options?: CreateApiOptions) => AxiosInstance;
};

export function isUnauthorizedError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 401;
}

function redirectToLoginIfClient() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
}

export function createApiFactory(config: ApiFactoryConfig): ApiFactory {
  const { baseUrl, logPrefix = '[BFF]', onUnauthorized = 'redirect' } = config;

  async function createServerApi(): Promise<AxiosInstance> {
    const c = await cookies();
    const accessToken = c.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
    const idToken = c.get(ID_TOKEN_COOKIE)?.value ?? null;
    const instance = createApi({ accessToken, idToken });

    if (onUnauthorized === 'redirect') {
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
    }

    return instance;
  }

  function createApi(options: CreateApiOptions = {}): AxiosInstance {
    const { accessToken, idToken, cookie } = options;

    const cfg: AxiosRequestConfig = {
      baseURL: baseUrl,
      timeout: 10_000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (accessToken) {
      cfg.headers!.Authorization = `Bearer ${accessToken}`;
    }
    if (idToken) {
      cfg.headers!['x-id-token'] = idToken;
    }
    if (cookie) {
      cfg.headers!.Cookie = cookie;
      cfg.withCredentials = true;
    }

    const instance = axios.create(cfg);

    instance.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        if (status === 401 && onUnauthorized === 'redirect') {
          redirectToLoginIfClient();
          return Promise.reject(err);
        }

        const method = err?.config?.method?.toUpperCase();
        const url = err?.config?.url;
        const data = err?.response?.data;
        const code = err?.code;
        console.error(
          `${logPrefix} ${method ?? '?'} ${url} → ${status ?? code ?? 'ERR'}`,
          data ?? err.message,
        );
        return Promise.reject(err);
      },
    );

    return instance;
  }

  return { createServerApi, createApi };
}
