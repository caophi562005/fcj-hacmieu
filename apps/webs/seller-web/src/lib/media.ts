import type { ImageType } from '@common/constants/media.constant';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreatePresignedUrlRequest,
  CreatePresignedUrlResponse,
} from '@common/interfaces/models/utility';
import { createServerApi } from './api';

export async function createPresignedUrl(
  payload: Omit<CreatePresignedUrlRequest, 'processId' | 'userId'>,
): Promise<CreatePresignedUrlResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<CreatePresignedUrlResponse>>(
    '/utility/media/presigned-url',
    payload,
  );

  if (!data?.data) {
    throw new Error('Tạo presigned URL thất bại.');
  }

  return data.data;
}

export function imageMimeTypeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return map[mimeType.toLowerCase()] ?? 'jpg';
}

export function buildProductImageFileName(
  index: number,
  mimeType: string,
): string {
  const extension = imageMimeTypeToExtension(mimeType);
  return `product-${Date.now()}-${index}.${extension}`;
}

export function buildSkuImageFileName(
  skuValue: string,
  index: number,
  mimeType: string,
): string {
  const extension = imageMimeTypeToExtension(mimeType);
  const normalizedSku = (skuValue || 'default')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `sku-${normalizedSku || 'default'}-${Date.now()}-${index}.${extension}`;
}

export type PresignedImageInput = {
  base64DataUrl: string;
  type: ImageType;
};

export function buildShopLogoFileName(mimeType: string): string {
  const extension = imageMimeTypeToExtension(mimeType);
  return `shop-logo-${Date.now()}.${extension}`;
}

export function buildShopBannerFileName(mimeType: string): string {
  const extension = imageMimeTypeToExtension(mimeType);
  return `shop-banner-${Date.now()}.${extension}`;
}
