import z from 'zod';

export const ImageTypeValues = {
  AVATAR: 'AVATAR',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
  BRAND: 'BRAND',
  BANNER: 'BANNER',
  REVIEW: 'REVIEW',
  OTHER: 'OTHER',
} as const;

export const ImageTypeEnums = z.enum([
  ImageTypeValues.AVATAR,
  ImageTypeValues.PRODUCT,
  ImageTypeValues.CATEGORY,
  ImageTypeValues.BRAND,
  ImageTypeValues.BANNER,
  ImageTypeValues.REVIEW,
  ImageTypeValues.OTHER,
]);

export type ImageType = z.infer<typeof ImageTypeEnums>;
