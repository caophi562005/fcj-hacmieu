import z from 'zod';

/**
 * Kiểm tra chín MySQL database URL.
 *
 * Chỉ nhận giao thức `mysql:` để một URL PostgreSQL còn sót lại không thể khởi
 * động service và âm thầm chạy sai database.
 */
const mysqlUrl = z.string().superRefine((raw, ctx) => {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Database URL không hợp lệ' });
    return;
  }

  if (url.protocol !== 'mysql:') {
    ctx.addIssue({
      code: 'custom',
      message: `Database URL phải dùng giao thức mysql://, đang là ${url.protocol}//`,
    });
  }
});

export const DatabaseConfigurationSchema = z.object({
  CATALOG_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  ORDER_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  PROMOTION_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  PAYMENT_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  UTILITY_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  IAM_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  SHOP_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  WALLET_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
  AI_SERVICE_MYSQL_DATABASE_URL: mysqlUrl,
});

const configServer = DatabaseConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  // Chỉ in tên biến và message. KHÔNG in giá trị: zod error chứa nguyên văn
  // input, nghĩa là database URL kèm password sẽ lọt vào log.
  console.error('Cấu hình database không hợp lệ:');
  for (const issue of configServer.error.issues) {
    console.error(`  ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
  process.exit(1);
}

export const DatabaseConfiguration = configServer.data;
