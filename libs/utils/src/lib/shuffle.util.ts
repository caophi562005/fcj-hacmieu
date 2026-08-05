import { randomInt } from 'node:crypto';

/**
 * Xáo trộn Fisher–Yates, trả về mảng mới và không thay đổi input.
 *
 * Dùng `crypto.randomInt` thay vì `Math.random()`: đây là thứ tự nội dung hiển
 * thị cho người dùng, không nên đoán trước được.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
