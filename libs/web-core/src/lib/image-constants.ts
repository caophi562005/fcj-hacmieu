/** Danh sách MIME types ảnh được phép upload trên toàn hệ thống. */
export const ALLOWED_IMAGE_MIME = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/** Chuỗi accept cho input[type=file] */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_MIME.join(',');

/** Max file size mặc định (10MB) */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
