import z from 'zod';

export const AiConfigurationSchema = z.object({
  GROQ_API_KEY: z.string().default(''),
});

const configServer = AiConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const AiConfiguration = configServer.data;
