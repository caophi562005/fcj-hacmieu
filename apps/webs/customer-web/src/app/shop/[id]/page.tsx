import {
  BadgeCheck,
  MessageCircle,
  Package,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../../components/MainShell';
import { ProductCard } from '../../../components/ProductCard';
import { PRODUCTS } from '../../../components/mockData';
import { getShop } from '../../../components/shopData';

const TABS = [
  { id: 'all', label: 'Tất cả sản phẩm' },
  { id: 'sale', label: 'Đang giảm giá' },
  { id: 'new', label: 'Mới nhất' },
];

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = getShop(id);

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <nav className="text-xs text-ink-subtle mb-3" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1">/</span>
          <span>Cửa hàng</span>
          <span className="mx-1">/</span>
          <span className="text-ink line-clamp-1">{shop.name}</span>
        </nav>

        {/* Banner + header */}
        <section className="bg-white rounded-md shadow-card overflow-hidden mb-4">
          <div className="relative h-40 md:h-52 bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shop.banner}
              alt={`Banner ${shop.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
          <div className="px-4 md:px-6 pb-5 relative flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-12 md:-mt-16">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden z-10 shrink-0 shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shop.avatar}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <span className="truncate">{shop.name}</span>
                  {shop.verified && (
                    <BadgeCheck
                      className="w-5 h-5 text-primary shrink-0"
                      aria-label="Đã xác minh"
                    />
                  )}
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-ink-muted">
                  <Stat
                    icon={<Package className="w-4 h-4" />}
                    value={shop.productCount}
                    label="Sản phẩm"
                  />
                  <Stat
                    icon={
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    }
                    value={shop.rating.toFixed(1)}
                    label="Đánh giá"
                  />
                  <Stat
                    icon={<MessageCircle className="w-4 h-4" />}
                    value={shop.responseRate}
                    label="Phản hồi"
                  />
                  <span className="text-ink-subtle">
                    Tham gia {shop.joined}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/chat?to=${shop.id}`}
                  className="inline-flex items-center gap-2 h-11 px-4 md:px-5 rounded bg-accent text-primary font-semibold text-sm hover:bg-accent/80 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat ngay
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-11 px-4 md:px-5 rounded bg-primary text-white font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,53,0.25)] hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <p className="text-sm text-ink-muted mb-4 max-w-3xl">
          {shop.description}
        </p>

        {/* Tabs + search */}
        <div className="bg-white rounded-md shadow-card border-b border-border-subtle sticky top-16 z-20 mb-4">
          <div className="flex items-center gap-2 px-2 md:px-4 overflow-x-auto scrollbar-none">
            {TABS.map((t, i) => {
              const active = i === 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`relative py-3.5 px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                    active ? 'text-primary' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
            <div className="ml-auto hidden sm:flex items-center h-9 rounded bg-surface-muted focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 border border-transparent focus-within:border-primary transition-colors my-2">
              <Search className="w-4 h-4 text-ink-subtle ml-2.5" />
              <input
                placeholder="Tìm trong shop…"
                className="flex-1 w-44 lg:w-56 bg-transparent border-0 outline-none text-sm px-2"
                aria-label="Tìm trong shop"
              />
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button className="btn-outline btn-md rounded-full px-8">
            Xem thêm sản phẩm
          </button>
        </div>
      </div>
    </MainShell>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <strong className="text-ink font-semibold">{value}</strong>
      <span>{label}</span>
    </span>
  );
}
