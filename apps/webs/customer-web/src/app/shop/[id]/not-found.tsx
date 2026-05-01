import { ArrowLeft, Compass, House, Store } from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../../components/MainShell';

export const metadata = {
  title: 'Không tìm thấy cửa hàng · V-Shop',
  description: 'Cửa hàng bạn tìm không tồn tại hoặc đã đóng cửa.',
};

export default function ShopNotFound() {
  return (
    <MainShell>
      <div className="container-page py-10 md:py-16">
        <nav className="text-xs text-ink-subtle mb-4" aria-label="Breadcrumb">
          <Link
            href="/"
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Trang chủ
          </Link>
          <span className="mx-1">/</span>
          <span>Cửa hàng</span>
          <span className="mx-1">/</span>
          <span className="text-ink">Không tìm thấy</span>
        </nav>

        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent border border-border-subtle shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-primary/15 blur-3xl"
          />

          <div className="relative grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center px-6 md:px-12 py-12 md:py-16">
            <div className="flex justify-center md:justify-start">
              <div className="relative inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary text-white shadow-floating">
                <Store
                  className="w-14 h-14 md:w-20 md:h-20"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full px-2 py-1 shadow-card">
                  Đã đóng
                </span>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-2 chip-primary">
                Lỗi 404
              </span>
              <h1 className="mt-3 text-2xl md:text-4xl font-bold leading-tight">
                Không tìm thấy cửa hàng này.
              </h1>
              <p className="mt-3 text-sm md:text-base text-ink-muted max-w-md">
                Cửa hàng có thể đã đóng, tạm ngừng hoạt động hoặc đường dẫn
                không chính xác. Bạn có thể khám phá các cửa hàng và sản phẩm
                khác tại V-Shop.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/" className="btn-primary btn-lg cursor-pointer">
                  <House className="w-4 h-4" />
                  Về trang chủ
                </Link>
                <Link
                  href="/search"
                  className="btn-outline btn-lg cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  Khám phá sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainShell>
  );
}
