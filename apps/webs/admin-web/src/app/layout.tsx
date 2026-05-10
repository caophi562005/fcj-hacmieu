import type { Metadata } from 'next';
import { SellerConvexProvider } from '../components/ConvexProvider';
import { SellerSidebar } from '../components/SellerSidebar';
import { SellerTopbar } from '../components/SellerTopbar';
import { ToastProvider } from '../components/ToastProvider';
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
        <SellerConvexProvider>
          <SellerSidebar />
          <SellerTopbar />
          <main className="ml-sidebar pt-topbar min-h-screen">
            <div className="p-6">{children}</div>
          </main>
          <ToastProvider />
        </SellerConvexProvider>
      </body>
    </html>
  );
}
