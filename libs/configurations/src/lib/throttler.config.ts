import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisConfiguration } from './redis.config';

export const ThrottlerProvider = ThrottlerModule.forRoot({
  throttlers: [
    {
      ttl: 60000,
      limit: 100,
    },
  ],
  errorMessage: 'Too many requests, please try again later.',
  storage: new ThrottlerStorageRedisService(RedisConfiguration.REDIS_URL),
});
