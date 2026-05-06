import z from 'zod';

export const ConvexConfigurationSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z.string(),
  NEXT_PUBLIC_CONVEX_SITE_URL: z.string(),
  CONVEX_DEPLOYMENT: z.string(),
});

const configServer = ConvexConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị Convex trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const ConvexConfiguration = configServer.data;

export const convexUrl = (): string =>
  ConvexConfiguration.NEXT_PUBLIC_CONVEX_URL;
