import Link from 'next/link';
import {
  ShoppingBag,
  House,
  Search,
  Compass,
  TicketPercent,
  MessageCircle,
} from 'lucide-react';
import { MainShell } from '../components/MainShell';

export const metadata = {
  title: 'Không tìm thấy trang · V-Shop',
  description: 'Trang bạn tìm không tồn tại hoặc đã được di chuyển.',
};

const POPULAR = [
  'Tai nghe Bluetooth',
  'Đồng hồ thông minh',
  'Áo thun nam',
  'Nồi chiên không dầu',
  'Son lì',
];

const QUICK_LINKS = [
  {
    href: '/',
    label: 'Trang chủ',
    desc: 'Quay về trang chủ V-Shop',
    icon: House,
  },
  {
    href: '/search',
    label: 'Khám phá sản phẩm',
    desc: 'Hàng triệu sản phẩm chính hãng',
    icon: Compass,
  },
  {
    href: '/profile/voucher',
    label: 'Kho voucher',
    desc: 'Săn ưu đãi giảm giá hấp dẫn',
    icon: TicketPercent,
  },
  {
    href: '/chat',
    label: 'Hỗ trợ',
    desc: 'Liên hệ V-Shop để được trợ giúp',
    icon: MessageCircle,
  },
];

export default function NotFound() {
  return (
    <MainShell>
      <div className="container-page py-10 md:py-16">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent border border-border-subtle shadow-card">
          {/* Decorative blobs (block-based style) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-12 w-16 h-16 rounded-2xl bg-primary/15 rotate-12"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-12 left-12 w-10 h-10 rounded-xl bg-accent rotate-45"
          />

          <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center px-6 md:px-12 py-12 md:py-16">
            {/* Left: 404 visual */}
            <div className="flex justify-center md:justify-start">
              <div
                className="relative inline-flex items-baseline gap-2 select-none"
                aria-hidden
              >
                <span className="text-[120px] md:text-[180px] font-black leading-none text-primary tracking-tighter drop-shadow-sm">
                  4
                </span>
                <span className="relative inline-flex items-center justify-center w-[110px] h-[110px] md:w-[160px] md:h-[160px] rounded-full bg-primary text-white shadow-floating">
                  <ShoppingBag
                    className="w-14 h-14 md:w-20 md:h-20"
                    strokeWidth={2.2}
                  />
                  <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full px-2 py-1 shadow-card">
                    Hết hàng!
                  </span>
                </span>
                <span className="text-[120px] md:text-[180px] font-black leading-none text-primary tracking-tighter drop-shadow-sm">
                  4
                </span>
              </div>
            </div>

            {/* Right: copy + CTA */}
            <div>
              <span className="inline-flex items-center gap-2 chip-primary">
                Lỗi 404
              </span>
              <h1 className="mt-3 text-2xl md:text-4xl font-bold leading-tight">
                Ôi! Trang này đã rời gian hàng.
              </h1>
              <p className="mt-3 text-sm md:text-base text-ink-muted max-w-md">
                Đường dẫn bạn truy cập không tồn tại, đã bị xóa hoặc tạm thời
                không khả dụng. Đừng lo — hàng triệu sản phẩm khác đang chờ bạn
                khám phá!
              </p>

              <form
                action="/search"
                className="mt-5 flex items-center h-12 rounded-md border border-border bg-white shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors overflow-hidden max-w-md"
              >
                <Search className="w-5 h-5 text-ink-subtle ml-3 shrink-0" />
                <input
                  type="search"
                  name="q"
                  placeholder="Tìm sản phẩm bạn cần…"
                  className="flex-1 bg-transparent border-0 outline-none px-3 text-sm"
                  aria-label="Tìm kiếm"
                />
                <button
                  type="submit"
                  className="bg-primary text-white h-full px-5 font-semibold text-sm hover:bg-primary-600 transition-colors"
                >
                  Tìm
                </button>
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-ink-subtle py-1">
                  Tìm kiếm phổ biến:
                </span>
                {POPULAR.map((kw) => (
                  <Link
                    key={kw}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="chip text-xs hover:bg-primary-50 hover:text-primary transition-colors"
                  >
                    {kw}
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/" className="btn-primary btn-lg">
                  <House className="w-4 h-4" />
                  Về trang chủ
                </Link>
                <Link href="/search" className="btn-outline btn-lg">
                  <Compass className="w-4 h-4" />
                  Khám phá sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="mt-8">
          <h2 className="text-base font-semibold mb-3">Có thể bạn đang tìm</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.href}
                  href={q.href}
                  className="card p-4 group hover:border-primary hover:shadow-floating transition-all"
                >
                  <div className="w-10 h-10 rounded-md bg-primary-50 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-sm">{q.label}</div>
                  <p className="text-xs text-ink-muted mt-1 line-clamp-2">
                    {q.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <p className="text-center text-xs text-ink-subtle mt-10">
          Mã lỗi: <span className="font-mono">404 NOT_FOUND</span> · Nếu bạn
          tin rằng đây là lỗi, vui lòng{' '}
          <Link href="/chat" className="text-primary hover:underline">
            liên hệ V-Shop
          </Link>
          .
        </p>
      </div>
    </MainShell>
  );
}
