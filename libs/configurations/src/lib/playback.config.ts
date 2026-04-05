import z from 'zod';

export const PlaybackConfigurationSchema = z.object({
  PLAYBACK_PRIVATE_KEY: z.string(),
  PLAYBACK_PUBLIC_KEY: z.string(),
});

const configServer = PlaybackConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const PlaybackConfiguration = configServer.data;
