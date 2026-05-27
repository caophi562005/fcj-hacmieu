import {
  ProductStatusEnums,
  ProductStatusValues,
  type ProductStatus,
} from '@common/constants/product.constant';
import { CopyButton, Pagination } from '@common/web-ui/index';
import { Eye, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getSellerProducts } from '../../lib/catalog';

export const metadata = { title: 'Quản lý Sản phẩm — V-Shop Seller' };

const STATUS_TABS: { key: 'all' | ProductStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: ProductStatusValues.ACTIVE, label: 'Đang bán' },
  { key: ProductStatusValues.INACTIVE, label: 'Đã ẩn' },
  { key: ProductStatusValues.DRAFT, label: 'Nháp' },
  { key: ProductStatusValues.BANNED, label: 'Vi phạm' },
];

const STATUS_STYLE: Record<ProductStatus, string> = {
  [ProductStatusValues.ACTIVE]:
    'bg-emerald-100 text-emerald-700 border-emerald-200',
  [ProductStatusValues.INACTIVE]:
    'bg-slate-100 text-slate-600 border-slate-200',
  [ProductStatusValues.DRAFT]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ProductStatusValues.BANNED]: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  [ProductStatusValues.ACTIVE]: 'Đang bán',
  [ProductStatusValues.INACTIVE]: 'Đã ẩn',
  [ProductStatusValues.DRAFT]: 'Nháp',
  [ProductStatusValues.BANNED]: 'Vi phạm',
};

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function parseStatus(raw?: string): ProductStatus | undefined {
  if (!raw) return undefined;
  const ok = ProductStatusEnums.safeParse(raw);
  return ok.success ? ok.data : undefined;
}

function buildHref(opts: {
  status?: ProductStatus | 'all';
  name?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (opts.status && opts.status !== 'all') sp.set('status', opts.status);
  if (opts.name) sp.set('name', opts.name);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : '/products';
}

function formatCurrency(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ';
}

type SearchParams = { status?: string; name?: string; page?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const status = parseStatus(sp.status);
  const name = (sp.name ?? '').trim();
  const limit = 10;

  const data = await getSellerProducts({
    page,
    limit,
    name: name || undefined,
    status,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);
  const activeKey: 'all' | ProductStatus = status ?? 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Quản lý Sản phẩm</h1>
          <p className="text-ink-muted text-sm mt-1">
            Tổng cộng {data.totalItems} sản phẩm.
          </p>
        </div>
        <Link
          href="/products/new"
          className="btn-primary btn-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tạo sản phẩm
        </Link>
      </div>

      {/* Tabs theo trạng thái */}
      <div className="card p-2 flex gap-1 overflow-x-auto">
        {STATUS_TABS.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <Link
              key={t.key}
              href={buildHref({ status: t.key, name })}
              className={`px-5 py-2 rounded text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary'
                  : 'text-ink-muted hover:bg-surface-muted'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Search bar */}
      <form
        action="/products"
        method="GET"
        className="card p-4 flex items-center gap-3"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            type="search"
            name="name"
            defaultValue={name}
            placeholder="Tìm theo tên sản phẩm..."
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary btn-md">
          Tìm kiếm
        </button>
      </form>

      {/* Table */}
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold w-[140px]">
                  ID
                </th>
                <th className="py-3 px-4 text-left font-semibold">Sản phẩm</th>
                <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                  Giá bán
                </th>
                <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                  Giá Ảo
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-right font-semibold">Đã bán</th>
                <th className="py-3 px-4 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.products.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              )}
              {data.products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px]"
                        title={p.id}
                      >
                        {p.id.slice(0, 8)}…
                      </span>
                      <CopyButton value={p.id} label="Copy ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      <div className="w-12 h-12 rounded bg-surface-muted border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-medium text-ink group-hover:text-primary transition-colors line-clamp-2 max-w-md">
                        {p.name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right align-middle font-medium whitespace-nowrap">
                    {formatCurrency(p.basePrice)}
                  </td>
                  <td className="py-3 px-4 text-right align-middle text-ink-muted whitespace-nowrap">
                    {formatCurrency(p.virtualPrice)}
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right align-middle font-medium">
                    {p.soldCount}
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <Link
                      href={`/products/${p.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-muted hover:text-primary hover:bg-primary-50 transition-colors"
                      aria-label="Xem chi tiết"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref({ status: activeKey, name, page: n })}
        ariaLabel="Phân trang sản phẩm"
      />
    </div>
  );
}
