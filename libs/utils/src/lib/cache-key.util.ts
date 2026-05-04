import { createHash } from 'crypto';

export const generateTokenCacheKey = (token: string): string => {
  const hash = createHash('sha256').update(token).digest('hex');
  return `iam:auth:token:${hash}`;
};

export const generateUserCacheKey = (userId: string): string => {
  const hash = createHash('sha256').update(userId).digest('hex');
  return `iam:user:profile:${hash}`;
};
