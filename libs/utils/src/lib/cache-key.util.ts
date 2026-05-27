import { createHash } from 'crypto';

export const generateTokenCacheKey = (token: string): string => {
  const hash = createHash('sha256').update(token).digest('hex');
  return `iam:auth:token:${hash}`;
};

export const generateUserCacheKey = (userId: string): string => {
  const hash = createHash('sha256').update(userId).digest('hex');
  return `iam:user:profile:${hash}`;
};

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const generateCategoryListCacheKey = (params: object): string => {
  const hash = createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
  return `catalog:category:list:${hash}`;
};

export const generateCategoryByIdCacheKey = (id: string): string => {
  return `catalog:category:id:${id}`;
};

export const generateBrandListCacheKey = (params: object): string => {
  const hash = createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
  return `catalog:brand:list:${hash}`;
};

export const generateBrandByIdCacheKey = (id: string): string => {
  return `catalog:brand:id:${id}`;
};

export const generateAttributeListCacheKey = (params: object): string => {
  const hash = createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
  return `catalog:attribute:list:${hash}`;
};

export const generateAttributeByIdCacheKey = (id: string): string => {
  return `catalog:attribute:id:${id}`;
};

// ─── Utility ──────────────────────────────────────────────────────────────────

export const generateReviewListCacheKey = (params: object): string => {
  const hash = createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
  return `utility:review:list:${hash}`;
};

export const generateReviewByIdCacheKey = (id: string): string => {
  return `utility:review:id:${id}`;
};

// ─── Shop ─────────────────────────────────────────────────────────────────────

export const generateShopByIdCacheKey = (id: string): string => {
  return `shop:shop:id:${id}`;
};

export const generateMerchantByIdCacheKey = (id: string): string => {
  return `shop:merchant:id:${id}`;
};
