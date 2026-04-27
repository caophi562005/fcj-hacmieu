import { AppConfiguration } from '@common/configurations/app.config';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BFF_BASE_URL = AppConfiguration.CUSTOMER_BFF_URL;

export type CreateApiOptions = {
  accessToken?: string | null;
  cookie?: string | null;
};

export function createApi(options: CreateApiOptions = {}): AxiosInstance {
  const { accessToken, cookie } = options;

  const config: AxiosRequestConfig = {
    baseURL: BFF_BASE_URL,
    timeout: 10_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  // Nếu có `accessToken` (Cognito access token) → set header `Authorization: Bearer ...`
  // Cho phép forward cookie (option) khi BFF check session bằng cookie
  if (accessToken) {
    config.headers!.Authorization = `Bearer ${accessToken}`;
  }
  if (cookie) {
    config.headers!.Cookie = cookie;
    config.withCredentials = true;
  }

  const instance = axios.create(config);

  // Log lỗi
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const method = err?.config?.method?.toUpperCase();
      const url = err?.config?.url;
      const data = err?.response?.data;
      const code = err?.code;
      console.error(
        `[BFF API] ${method ?? '?'} ${url} → ${status ?? code ?? 'ERR'}`,
        data ?? err.message,
      );
      return Promise.reject(err);
    },
  );

  return instance;
}
