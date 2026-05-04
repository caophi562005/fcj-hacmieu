import type { Metadata } from 'next';
import { SellerSidebar } from '../components/SellerSidebar';
import { SellerTopbar } from '../components/SellerTopbar';
import './global.css';

export const metadata: Metadata = {
  title: 'V-Shop Seller Center',
  description:
    'Cổng quản lý dành cho nhà bán hàng V-Shop: sản phẩm, đơn hàng, tin nhắn, tài chính.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-ink">
        <SellerSidebar />
        <SellerTopbar />
        <main className="ml-sidebar pt-topbar min-h-screen">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
