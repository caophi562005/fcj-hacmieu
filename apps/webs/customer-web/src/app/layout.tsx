import type { Metadata } from 'next';
import { BottomNav } from '../components/BottomNav';
import { CustomerConvexProvider } from '../components/ConvexProvider';
import { Header } from '../components/Header';
import { ToastProvider } from '../components/ToastProvider';
import './global.css';

export const metadata: Metadata = {
  title: 'V-Shop — Mua sắm trực tuyến',
  description:
    'V-Shop: Sàn thương mại điện tử Việt Nam. Hàng triệu sản phẩm chính hãng, giao nhanh toàn quốc, thanh toán an toàn.',
};

// Header & BottomNav nằm ở root layout để persistent giữa các navigation:
// - <NotificationBell /> (Client Component dùng EventSource) không bị unmount
//   → SSE giữ 1 connection duy nhất toàn app, không reconnect mỗi lần đổi route.
// - Tránh re-fetch /iam/user và /utility/notification mỗi navigation (React.cache
//   per-request đã dedupe trong cùng render, nhưng layout persistent giúp Header
//   chỉ re-render khi server invalidate).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-surface-alt text-ink">
        <CustomerConvexProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <BottomNav />
          </div>
          <ToastProvider />
        </CustomerConvexProvider>
      </body>
    </html>
  );
}
