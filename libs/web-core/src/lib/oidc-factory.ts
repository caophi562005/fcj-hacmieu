import { Issuer, type Client } from 'openid-client';

export type OidcConfig = {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function createOidcClientFactory(config: OidcConfig) {
  let cachedClient: Client | null = null;

  return async function getOidcClient(): Promise<Client> {
    if (cachedClient) return cachedClient;

    const issuerUrl = `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`;
    const issuer = await Issuer.discover(issuerUrl);

    cachedClient = new issuer.Client({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uris: [config.redirectUri],
      response_types: ['code'],
    });

    return cachedClient;
  };
}
