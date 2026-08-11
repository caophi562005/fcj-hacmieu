import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/**
 * Khởi tạo PrismaMariaDb adapter từ Database URL.
 * Nếu URL chứa `ssl-mode=REQUIRED` (Aiven Cloud), tự động kích hoạt TLS cho mariadb driver.
 * Đối với MySQL local / tiêu chuẩn, kết nối trực tiếp qua URL.
 */
export function createPrismaMariaDbAdapter(url: string): PrismaMariaDb {
  const parsed = new URL(url);
  const sslMode = (parsed.searchParams.get('ssl-mode') ?? '').toUpperCase();

  if (sslMode === 'REQUIRED' || parsed.hostname.includes('aivencloud.com')) {
    return new PrismaMariaDb({
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10_000,
    });
  }

  return new PrismaMariaDb(url);
}

/**
 * Che credential trước khi ghi log.
 *
 * Zod error hoặc driver error có thể chứa nguyên văn URL.
 * Hàm này che username/password trước khi ghi log.
 */
export function maskDatabaseError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  return (
    message
      // mysql://user:pass@host:port/db
      .replace(/(\w+:\/\/)[^:@/\s]+:[^@\s]+@/g, '$1***:***@')
      // user=..., password=...
      .replace(/(password|pwd)=[^\s&;,)]+/gi, '$1=***')
      .replace(/(user|username)=[^\s&;,)]+/gi, '$1=***')
  );
}

