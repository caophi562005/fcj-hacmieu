import {
  buildProductImageFileName,
  buildShopBannerFileName,
  buildShopLogoFileName,
  buildSkuImageFileName,
  createServerMediaClient,
  imageMimeTypeToExtension,
  type PresignedImageInput,
} from '@common/web-core/lib/server-media';
import { createServerApi } from './api';

export {
  buildProductImageFileName,
  buildShopBannerFileName,
  buildShopLogoFileName,
  buildSkuImageFileName,
  imageMimeTypeToExtension,
  type PresignedImageInput,
};

const sellerMediaClient = createServerMediaClient(createServerApi);
export const { createPresignedUrl } = sellerMediaClient;
