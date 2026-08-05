/**
 * Tạo tham số kết nối MySQL cho `PrismaMariaDb` từ một database URL.
 *
 * Chuỗi kết nối Aiven dùng `ssl-mode=REQUIRED`, đó là cú pháp của MySQL CLI mà
 * driver không đọc từ URL. Vì vậy TLS được cấu hình tường minh qua option thay vì
 * phó mặc cho query parameter.
 *
 * Ánh xạ giữ đúng ngữ nghĩa gốc:
 *   REQUIRED                    -> bắt buộc mã hoá, KHÔNG xác minh CA
 *   VERIFY_CA / VERIFY_IDENTITY -> mã hoá và xác minh CA
 *   không có tham số            -> xác minh CA (mặc định an toàn)
 */
export interface MysqlAdapterConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  connectionLimit: number;
  idleTimeout: number;
  acquireTimeout: number;
  connectTimeout: number;
}

/**
 * Số connection tối đa mỗi service được giữ.
 *
 * Chín service dùng chung MỘT instance MySQL, nên đây là ngân sách chia sẻ chứ
 * không phải giới hạn riêng lẻ. Server hiện có `max_connections = 76`; đặt 10 cho
 * mỗi service là 90 và pool không tạo nổi connection nào, service chết ở
 * health-check với "pool timeout ... active=0 idle=0".
 *
 * 5 × 9 = 45, còn dư hơn 30 cho migration script, Aiven monitoring và thao tác
 * thủ công. Kiểm tra lại bằng `node tools/check-connections.mjs` nếu đổi gói dịch
 * vụ hoặc thêm service.
 */
const DEFAULT_CONNECTION_LIMIT = 5;

export function buildMysqlAdapterConfig(url: string): MysqlAdapterConfig {
  const parsed = new URL(url);
  const sslMode = (parsed.searchParams.get('ssl-mode') ?? '').toUpperCase();

  const limit = Number(process.env.MYSQL_CONNECTION_LIMIT);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
    ssl: sslMode === 'REQUIRED' ? { rejectUnauthorized: false } : true,
    connectionLimit:
      Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_CONNECTION_LIMIT,
    // Thả connection rỗi sau 60 giây. Server đặt wait_timeout 8 tiếng nên nếu
    // không thả ở phía client, connection rỗi sẽ chiếm ngân sách rất lâu.
    idleTimeout: 60,
    acquireTimeout: 20_000,
    connectTimeout: 30_000,
  };
}

/**
 * Che credential trước khi ghi log.
 *
 * Driver mariadb đưa host và user vào message lỗi, và zod error chứa nguyên văn
 * URL. Không có hàm này thì password lọt vào log khi kết nối thất bại.
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
