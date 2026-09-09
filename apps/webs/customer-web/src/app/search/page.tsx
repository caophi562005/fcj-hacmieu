import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { FilterForm } from '../../components/FilterForm';
import { MainShell } from '../../components/MainShell';
import { ProductCard } from '../../components/ProductCard';
import { SearchBar } from '../../components/SearchBar';
import {
  getManyProducts,
  getRootCategories,
  toCardProduct,
} from '../../lib/catalog';

export const dynamic = 'force-dynamic';

const POPULAR = [
  'Áo thun nam',
  'Tai nghe',
  'Nồi chiên không dầu',
  'Smartwatch',
  'Son lì',
];

type SortKey = 'newest' | 'price_asc' | 'price_desc';

const SORTS: {
  key: SortKey;
  label: string;
  sortBy: 'createdAt' | 'sale' | 'price';
  orderBy: 'asc' | 'desc';
}[] = [
  { key: 'newest', label: 'Mới nhất', sortBy: 'createdAt', orderBy: 'desc' },
  { key: 'price_asc', label: 'Giá tăng', sortBy: 'price', orderBy: 'asc' },
  { key: 'price_desc', label: 'Giá giảm', sortBy: 'price', orderBy: 'desc' },
];

type SearchParams = {
  q?: string;
  categories?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  orderBy?: string;
  page?: string;
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function toPositiveInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

function currentSortKey(sortBy?: string, orderBy?: string): SortKey {
  if (sortBy === 'price' && orderBy === 'asc') return 'price_asc';
  if (sortBy === 'price' && orderBy === 'desc') return 'price_desc';
  return 'newest';
}

function buildSearchUrl(
  base: SearchParams,
  overrides: Partial<SearchParams> & { categories?: string[] },
): string {
  const sp = new URLSearchParams();
  const merged: Record<string, string | string[] | undefined> = {
    q: overrides.q ?? base.q,
    minPrice: overrides.minPrice ?? base.minPrice,
    maxPrice: overrides.maxPrice ?? base.maxPrice,
    sortBy: overrides.sortBy ?? base.sortBy,
    orderBy: overrides.orderBy ?? base.orderBy,
    page: overrides.page ?? base.page,
    categories:
      overrides.categories !== undefined
        ? overrides.categories
        : toArray(base.categories),
  };
  for (const [k, v] of Object.entries(merged)) {
    if (v == null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
    else sp.append(k, v);
  }
  const qs = sp.toString();
  return qs ? `/search?${qs}` : '/search';
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const selectedCategories = toArray(sp.categories);
  const minPrice = toPositiveInt(sp.minPrice);
  const maxPrice = toPositiveInt(sp.maxPrice);
  const page = toPositiveInt(sp.page) ?? 1;
  const sortKey = currentSortKey(sp.sortBy, sp.orderBy);
  const activeSort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0];

  const [categories, productsRes] = await Promise.all([
    getRootCategories(),
    getManyProducts({
      name: q || undefined,
      categories: selectedCategories.length ? selectedCategories : undefined,
      minPrice,
      maxPrice,
      sortBy: activeSort.sortBy,
      orderBy: activeSort.orderBy,
      page,
      limit: 12,
    }),
  ]);

  const products = productsRes.products ?? [];
  const totalItems = productsRes.totalItems ?? 0;
  const totalPages = productsRes.totalPages ?? 0;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <nav className="text-xs text-ink-subtle mb-3" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>{' '}
          <span className="mx-1">/</span>{' '}
          <span className="text-ink">
            {q ? `Tìm kiếm: "${q}"` : 'Tìm kiếm'}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-4">
          <FilterForm
            categories={categories}
            selectedCategories={selectedCategories}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />

          <div className="min-w-0">
            {/* Search bar — Client Component dùng router.push để soft-nav */}
            <div className="card p-4 mb-3">
              <SearchBar variant="page" defaultValue={q} preserveFilters />
              {!q && (
                <div className="mt-3">
                  <div className="text-xs font-medium mb-2 text-ink-muted">
                    Tìm kiếm phổ biến
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((kw) => (
                      <Link
                        key={kw}
                        href={buildSearchUrl(sp, { q: kw, page: '1' })}
                        className="chip cursor-pointer hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort row */}
            <div className="card p-3 mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-muted mr-1">Sắp xếp theo</span>
              {SORTS.map((s) => {
                const active = s.key === sortKey;
                return (
                  <Link
                    key={s.key}
                    href={buildSearchUrl(sp, {
                      sortBy: s.sortBy,
                      orderBy: s.orderBy,
                      page: '1',
                    })}
                    className={`btn-sm rounded border transition-colors cursor-pointer inline-flex items-center justify-center leading-none ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
              <span className="text-xs text-ink-subtle ml-auto">
                {totalItems.toLocaleString('vi-VN')} sản phẩm
              </span>
            </div>

            {q && (
              <div className="text-sm text-ink-muted mb-3">
                Kết quả cho{' '}
                <span className="font-semibold text-ink">“{q}”</span> ·{' '}
                <span className="font-semibold text-ink">
                  {totalItems.toLocaleString('vi-VN')}
                </span>{' '}
                sản phẩm
              </div>
            )}

            {products.length === 0 ? (
              <div className="card p-10 text-center">
                <div className="text-lg font-semibold mb-1">
                  Không tìm thấy sản phẩm
                </div>
                <p className="text-sm text-ink-muted">
                  Hãy thử từ khóa khác hoặc thay đổi bộ lọc.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <ProductCard key={p.id} p={toCardProduct(p)} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={(n) => buildSearchUrl(sp, { page: String(n) })}
              />
            )}
          </div>
        </div>
      </div>
    </MainShell>
  );
}

function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (n: number) => string;
}) {
  const pages = buildPageList(page, totalPages);

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      aria-label="Phân trang"
    >
      <PageButton
        href={buildHref(Math.max(1, page - 1))}
        disabled={page <= 1}
        ariaLabel="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-subtle">
            …
          </span>
        ) : (
          <PageButton key={p} href={buildHref(p)} active={p === page}>
            {p}
          </PageButton>
        ),
      )}

      <PageButton
        href={buildHref(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        ariaLabel="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  href,
  children,
  active,
  disabled,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const base =
    'inline-flex items-center justify-center w-9 h-9 rounded text-sm font-medium transition-colors';
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${base} bg-white border border-border text-ink-subtle opacity-50 cursor-not-allowed`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={`${base} cursor-pointer ${
        active
          ? 'bg-primary text-white border border-primary'
          : 'bg-white border border-border hover:border-primary hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push('...');
  }
  return out;
}
