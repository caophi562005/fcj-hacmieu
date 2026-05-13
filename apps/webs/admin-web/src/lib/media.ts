import { createPresignedUrl as _createPresignedUrl } from '@common/web-core/lib/media';
import { createServerApi } from './api';

export {
  buildProductImageFileName,
  buildShopBannerFileName,
  buildShopLogoFileName,
  buildSkuImageFileName,
  imageMimeTypeToExtension,
  type PresignedImageInput,
} from '@common/web-core/lib/media';

export async function createPresignedUrl(
  payload: Parameters<typeof _createPresignedUrl>[1],
) {
  const api = await createServerApi();
  return _createPresignedUrl(api, payload);
}
