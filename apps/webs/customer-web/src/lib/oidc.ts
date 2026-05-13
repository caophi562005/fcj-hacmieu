import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { createOidcClientFactory } from '@common/web-core/lib/oidc-factory';

export const getOidcClient = createOidcClientFactory({
  region: BaseConfiguration.AWS_REGION,
  userPoolId: AuthConfiguration.USER_POOL_ID,
  clientId: AuthConfiguration.CUSTOMER_CLIENT_ID,
  clientSecret: AuthConfiguration.CUSTOMER_CLIENT_SECRET,
  redirectUri: AuthConfiguration.CUSTOMER_REDIRECT_URI,
});
