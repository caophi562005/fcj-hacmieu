import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import ms, { StringValue } from 'ms';
import z from 'zod';

export const RedisConfigurationSchema = z.object({
  REDIS_URL: z.string(),
  REDIS_TTL: z.string(),

  CACHE_TOKEN_TTL: z.string(),
  CACHE_CATEGORY_TTL: z.string(),
  CACHE_SHIPS_FROM_TTL: z.string(),
  CACHE_USER_TTL: z.string(),

  PAYMENT_TTL: z.string(),
});

const configServer = RedisConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const RedisConfiguration = configServer.data;

export const CacheProvider = CacheModule.register({
  stores: [createKeyv(RedisConfiguration.REDIS_URL)],
  ttl: ms(RedisConfiguration.REDIS_TTL as StringValue), // 30 minutes
});
