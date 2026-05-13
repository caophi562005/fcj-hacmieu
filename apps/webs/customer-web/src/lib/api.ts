import { AppConfiguration } from '@common/configurations/app.config';
import { createApiFactory } from '@common/web-core/lib/api-factory';

export const { createServerApi, createApi } = createApiFactory({
  baseUrl: AppConfiguration.CUSTOMER_BFF_URL,
  logPrefix: '[Customer BFF]',
  onUnauthorized: 'ignore',
});

export {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@common/web-core/lib/constants';
