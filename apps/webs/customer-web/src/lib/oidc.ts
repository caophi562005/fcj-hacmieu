import { AuthConfiguration } from '@common/configurations/auth.config';
import { BaseConfiguration } from '@common/configurations/base.config';
import { Issuer, type Client } from 'openid-client';

// Client được cache vào module scope để chỉ discover OIDC config 1 lần
let cachedClient: Client | null = null;

export async function getOidcClient(): Promise<Client> {
  if (cachedClient) return cachedClient;

  const region = BaseConfiguration.AWS_REGION;
  const issuerUrl = `https://cognito-idp.${region}.amazonaws.com/${AuthConfiguration.USER_POOL_ID}`;

  const issuer = await Issuer.discover(issuerUrl);
  cachedClient = new issuer.Client({
    client_id: AuthConfiguration.CLIENT_ID,
    client_secret: AuthConfiguration.CLIENT_SECRET,
    redirect_uris: [AuthConfiguration.REDIRECT_URI],
    response_types: ['code'],
  });

  return cachedClient;
}
