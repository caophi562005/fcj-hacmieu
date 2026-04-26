import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'V-Shop — Mua sắm trực tuyến',
  description:
    'V-Shop: Sàn thương mại điện tử Việt Nam. Hàng triệu sản phẩm chính hãng, giao nhanh toàn quốc, thanh toán an toàn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-surface-alt text-ink">{children}</body>
    </html>
  );
}
