/** Format số tiền VNĐ: 1.250.000đ, âm: - 1.250.000đ */
export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '- ' : '';
  return `${sign}${Math.abs(amount).toLocaleString('vi-VN')}đ`;
}

/** Format ISO date → dd/MM/yyyy HH:mm */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Format số lượng gọn: 1.2k / 3.4M */
export function formatCount(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}
