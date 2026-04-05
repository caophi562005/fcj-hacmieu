import z from 'zod';

export const BankConfigurationSchema = z.object({
  BANK_CODE: z.string(),
  BANK_NUMBER: z.string(),
});

const configServer = BankConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const BankConfiguration = configServer.data;
