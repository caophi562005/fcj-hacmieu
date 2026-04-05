import { z } from 'zod';

export const BaseConfigurationSchema = z
  .object({
    NODE_ENV: z.string().default('development'),
    GLOBAL_PREFIX: z.string().min(1).default('api/v1'),
    // AVATAR_DEFAULT_URL: z.string(),
    OTP_EXPIRES: z.string().default('10m'),
    SOFT_DELETE_TTL: z.string().default('30d'),
  })
  .transform((data) => ({
    ...data,
    IS_DEV: data.NODE_ENV === 'development',
  }));

const configServer = BaseConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const BaseConfiguration = configServer.data;
