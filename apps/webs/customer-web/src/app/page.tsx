import {
  ChevronRight,
  Headphones,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../components/MainShell';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, PRODUCTS } from '../components/mockData';

const BANNERS = [
  {
    title: 'Săn deal mỗi ngày',
    subtitle: 'Giảm đến 50% — Freeship toàn quốc',
    cta: 'Mua ngay',
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
  },
];

const PERKS = [
  { icon: Truck, label: 'Giao nhanh 2h' },
  { icon: ShieldCheck, label: 'Chính hãng 100%' },
  { icon: Tag, label: 'Giá tốt mỗi ngày' },
  { icon: Headphones, label: 'Hỗ trợ 24/7' },
];

export default function HomePage() {
  const featured = PRODUCTS;
  return (
    <MainShell>
      {/* Hero banner */}
      <section className="container-page pt-4 md:pt-6">
        <div className="relative overflow-hidden rounded-lg shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BANNERS[0].image}
            alt={BANNERS[0].title}
            className="w-full h-40 sm:h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
            <div className="px-6 md:px-12 max-w-md text-white">
              <div className="text-xs uppercase tracking-wider opacity-90">
                Mua sắm thông minh
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mt-1">
                {BANNERS[0].title}
              </h1>
              <p className="text-sm md:text-base mt-2 opacity-95">
                {BANNERS[0].subtitle}
              </p>
              <Link
                href="/search"
                className="btn-primary btn-md mt-4 inline-flex"
              >
                {BANNERS[0].cta}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="container-page mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PERKS.map((p) => (
            <div
              key={p.label}
              className="card flex items-center gap-3 p-3 md:p-4"
            >
              <div className="w-10 h-10 rounded-md bg-primary-50 text-primary flex items-center justify-center">
                <p.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium">{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-6">
        <div className="card p-4">
          <h2 className="text-base font-semibold mb-3">Danh mục nổi bật</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/search?cat=${c.slug}`}
                className="flex flex-col items-center gap-1.5 p-2 rounded hover:bg-surface-muted transition-colors text-center"
              >
                <span className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-2xl">
                  {c.icon}
                </span>
                <span className="text-xs text-ink leading-tight line-clamp-2">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold">Gợi ý hôm nay</h2>
          <Link href="/search" className="text-sm text-primary hover:underline">
            Xem thêm
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link href="/search" className="btn-outline btn-md rounded-full px-8">
            Xem thêm sản phẩm
          </Link>
        </div>
      </section>
    </MainShell>
  );
}
