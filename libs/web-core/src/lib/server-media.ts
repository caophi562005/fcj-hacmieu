import type { AxiosInstance } from 'axios';
import { createPresignedUrl as requestPresignedUrl } from './media';

export {
  buildProductImageFileName,
  buildShopBannerFileName,
  buildShopLogoFileName,
  buildSkuImageFileName,
  imageMimeTypeToExtension,
  type PresignedImageInput,
} from './media';

export function createServerMediaClient(
  createServerApi: () => Promise<AxiosInstance>,
) {
  async function createPresignedUrl(
    payload: Parameters<typeof requestPresignedUrl>[1],
  ) {
    const api = await createServerApi();
    return requestPresignedUrl(api, payload);
  }

  return { createPresignedUrl };
}
