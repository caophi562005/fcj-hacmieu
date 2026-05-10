import { AppConfiguration } from '@common/configurations/app.config';
import { AuthConfiguration } from '@common/configurations/auth.config';

function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `[admin-web] Missing required environment variable: ${key}`,
    );
  }
  return value;
}

export const AdminWebConfig = {
  bffUrl: () => required(AppConfiguration.ADMIN_BFF_URL, 'ADMIN_BFF_URL'),
  webUrl: () => required(AppConfiguration.ADMIN_WEB_URL, 'ADMIN_WEB_URL'),
  redirectUri: () =>
    required(AuthConfiguration.ADMIN_REDIRECT_URI, 'ADMIN_REDIRECT_URI'),
  logoutUri: () =>
    required(AuthConfiguration.ADMIN_LOGOUT_URI, 'ADMIN_LOGOUT_URI'),
};
