import z from 'zod';

export const PaginationConfigurationSchema = z.object({
  DEFAULT_PAGE_PAGINATION: z.coerce.number().default(1),
  DEFAULT_LIMIT_PAGINATION: z.coerce.number().default(10),
});

const configServer = PaginationConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const PaginationConfiguration = configServer.data;
