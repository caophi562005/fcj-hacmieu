import { AppConvexProvider, ToastProvider } from '@common/web-ui/index';
import type { Metadata } from 'next';

import './global.css';

export const metadata: Metadata = {
  title: 'V-Shop Admin Center',
  description:
    'Cổng quản trị V-Shop: tài khoản, sản phẩm, đơn hàng, shop, voucher và rút tiền.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-ink">
        <AppConvexProvider>
          {children}
          <ToastProvider />
        </AppConvexProvider>
      </body>
    </html>
  );
}
