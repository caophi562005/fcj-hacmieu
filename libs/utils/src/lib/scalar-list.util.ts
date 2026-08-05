/**
 * Đọc và ghi các trường từng là scalar list (`String[]`) trên PostgreSQL, nay là
 * cột JSON trên MySQL.
 *
 * Tám trường dùng lớp này: `ReviewSummary.pros`, `ReviewSummary.cons`,
 * `Product.images`, `User.group`, `Payment.orderId`, `Redemption.orderIds`,
 * `Report.media`, `Review.mediaUrls`.
 *
 * Tập trung vào một chỗ để bảy trường hành xử giống nhau và chỉ cần kiểm thử một
 * lần. Hợp đồng gRPC và zod schema vẫn là `string[]`, nên mọi chuyển đổi nằm ở
 * tầng repository.
 */

/**
 * Đọc cột JSON thành `string[]`.
 *
 * Trả `[]` cho `null` và `undefined`: trên PostgreSQL scalar list không bao giờ
 * NULL, vắng giá trị nghĩa là mảng rỗng.
 *
 * Ném lỗi khi giá trị không phải mảng chuỗi. Không âm thầm trả `[]`, vì dữ liệu
 * sai kiểu là dấu hiệu hỏng dữ liệu cần dừng lại thay vì che đi.
 */
export function readStringList(
  value: unknown,
  context?: { model: string; field: string; key?: string },
): string[] {
  if (value === null || value === undefined) return [];

  const describe = () =>
    context
      ? `${context.model}.${context.field}${context.key ? ` (id ${context.key})` : ''}`
      : 'scalar list';

  // Driver có thể trả cột JSON dưới dạng chuỗi tuỳ cấu hình, nên chấp nhận cả hai.
  let parsed: unknown = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new Error(`${describe()}: giá trị JSON không hợp lệ`);
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${describe()}: mong đợi mảng, nhận ${typeof parsed}`);
  }

  const invalid = parsed.findIndex((item) => typeof item !== 'string');
  if (invalid !== -1) {
    throw new Error(
      `${describe()}: phần tử ${invalid} không phải chuỗi (${typeof parsed[invalid]})`,
    );
  }

  return parsed as string[];
}

/**
 * Ghi `string[]` vào cột JSON.
 *
 * Giữ nguyên thứ tự, giữ phần tử trùng lặp, không trim, không normalize Unicode.
 * Bất kỳ chuẩn hoá nào cũng làm dữ liệu đọc ra khác dữ liệu ghi vào.
 */
export function writeStringList(
  value: readonly string[] | null | undefined,
): string[] {
  if (value === null || value === undefined) return [];
  return [...value];
}
