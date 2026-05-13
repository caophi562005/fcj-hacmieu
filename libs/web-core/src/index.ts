// index.ts — client-safe exports
export type { ApiFactoryConfig, CreateApiOptions } from './lib/api-factory';
export { decodeJwtPayload, withCacheBust } from './lib/auth-helpers';
export {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './lib/constants';
export type { OidcConfig } from './lib/oidc-factory';

export { formatCount, formatCurrency, formatDateTime } from './lib/format';
export {
  base64DataUrlToBuffer,
  fileToBase64DataUrl,
  parseBase64DataUrl,
} from './lib/image-base64';
export {
  ALLOWED_IMAGE_MIME,
  IMAGE_ACCEPT,
  MAX_IMAGE_SIZE_BYTES,
  type AllowedImageMime,
} from './lib/image-constants';
export {
  buildProductImageFileName,
  buildShopBannerFileName,
  buildShopLogoFileName,
  buildSkuImageFileName,
  imageMimeTypeToExtension,
  type PresignedImageInput,
} from './lib/media';
