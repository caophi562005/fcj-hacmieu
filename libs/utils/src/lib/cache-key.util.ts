import { createHash } from 'crypto';

export const generateCategoryCacheKey = (parentCategoryId: string): string => {
  const hash = createHash('sha256').update(parentCategoryId).digest('hex');
  return `category:${hash}`;
};

export const generateShipsFromCacheKey = (): string => {
  // const hash = createHash('sha256').update(parentCategoryId).digest('hex');
  return `ships-from:all`;
};

export const generateTokenCacheKey = (token: string): string => {
  const hash = createHash('sha256').update(token).digest('hex');
  return `user-token:${hash}`;
};

export const generateUserCacheKey = (userId: string): string => {
  const hash = createHash('sha256').update(userId).digest('hex');
  return `user:${hash}`;
};
