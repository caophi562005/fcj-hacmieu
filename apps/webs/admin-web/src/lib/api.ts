import { createApiFactory } from '@common/web-core/lib/api-factory';
import { AdminWebConfig } from './config';

export const { createServerApi, createApi } = createApiFactory({
  baseUrl: AdminWebConfig.bffUrl(),
  logPrefix: '[Admin BFF]',
  onUnauthorized: 'redirect',
});

export { isUnauthorizedError } from '@common/web-core/lib/api-factory';
export {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@common/web-core/lib/constants';
