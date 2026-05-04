import { AppConfiguration } from '@common/configurations/app.config';
import { AuthConfiguration } from '@common/configurations/auth.config';

// Strict accessors — fail-fast nếu env chưa cấu hình cho seller-web.
function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `[seller-web] Missing required environment variable: ${key}`,
    );
  }
  return value;
}

export const SellerWebConfig = {
  bffUrl: () => required(AppConfiguration.SELLER_BFF_URL, 'SELLER_BFF_URL'),
  webUrl: () => required(AppConfiguration.SELLER_WEB_URL, 'SELLER_WEB_URL'),
  redirectUri: () =>
    required(AuthConfiguration.SELLER_REDIRECT_URI, 'SELLER_REDIRECT_URI'),
  logoutUri: () =>
    required(AuthConfiguration.SELLER_LOGOUT_URI, 'SELLER_LOGOUT_URI'),
};
