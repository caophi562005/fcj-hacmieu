import { createApiFactory } from '@common/web-core/lib/api-factory';
import { SellerWebConfig } from './config';

export const { createServerApi, createApi } = createApiFactory({
  baseUrl: SellerWebConfig.bffUrl(),
  logPrefix: '[Seller BFF]',
  onUnauthorized: 'redirect',
});

export {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@common/web-core/lib/constants';
