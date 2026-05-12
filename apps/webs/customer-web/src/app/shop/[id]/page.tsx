import { MessageCircle, Package, Phone, Plus, Store } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MainShell } from '../../../components/MainShell';
import { Pagination } from '../../../components/Pagination';
import { ProductCard } from '../../../components/ProductCard';
import { getManyProducts, toCardProduct } from '../../../lib/catalog';
import { getShopById } from '../../../lib/shop';

function formatJoined(createdAt: string | Date): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return 'hôm nay';
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(months / 12);
  return `${years} năm trước`;
}

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function ShopDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);

  const [shop, productsRes] = await Promise.all([
    getShopById(id),
    getManyProducts({ shopId: id, limit: 20, page }),
  ]);
  if (!shop) notFound();

  const products = productsRes.products ?? [];
  const productCount = productsRes.totalItems ?? products.length;
  const totalPages = productsRes.totalPages ?? 1;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <nav className="text-xs text-ink-subtle mb-3" aria-label="Breadcrumb">
          <Link
            href="/"
            className="hover:text-primary transition-colors cursor-pointer"
          >
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
            {shop.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.banner}
                alt={`Banner ${shop.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/15 via-accent to-primary/5" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
          <div className="px-4 md:px-6 pb-5 relative flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-12 md:-mt-16">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden z-10 shrink-0 shadow-card flex items-center justify-center">
              {shop.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store
                  className="w-10 h-10 md:w-12 md:h-12 text-ink-subtle"
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold">
                  <span className="line-clamp-1">{shop.name}</span>
                </h1>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-ink-muted">
                  <Stat
                    icon={<Package className="w-4 h-4" />}
                    value={String(productCount)}
                    label="Sản phẩm"
                  />
                  {shop.phone && (
                    <Stat
                      icon={<Phone className="w-4 h-4" />}
                      value={shop.phone}
                      label="Hotline"
                    />
                  )}
                  <span className="text-ink-subtle">
                    Tham gia {formatJoined(shop.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/chat?to=${shop.userId}&name=${encodeURIComponent(shop.name)}&avatar=${encodeURIComponent(shop.logo ?? '')}`}
                  className="inline-flex items-center gap-2 h-11 px-4 md:px-5 rounded bg-accent text-primary font-semibold text-sm hover:bg-accent/80 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat ngay
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-11 px-4 md:px-5 rounded bg-primary text-white font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,53,0.25)] hover:bg-primary-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        {shop.description && (
          <p className="text-sm text-ink-muted mb-4 max-w-3xl whitespace-pre-line">
            {shop.description}
          </p>
        )}

        {/* Product grid */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Sản phẩm ({productCount})</h2>
        </div>

        {products.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-lg font-semibold mb-1">
              Cửa hàng chưa có sản phẩm
            </div>
            <p className="text-sm text-ink-muted">
              Hãy quay lại sau — shop đang chuẩn bị hàng mới.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} p={toCardProduct(p)} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(n) =>
                n === 1 ? `/shop/${id}` : `/shop/${id}?page=${n}`
              }
              ariaLabel="Phân trang sản phẩm"
            />
          </>
        )}
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
