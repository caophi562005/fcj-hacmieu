import {
  OrderStatusEnums,
  OrderStatusValues,
  type OrderStatus,
} from '@common/constants/order.constant';
import { CopyButton, Pagination } from '@common/web-ui/index';
import { Eye, ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';
import { getSellerOrders } from '../../../lib/order';

export const metadata = { title: 'Quản lý đơn hàng — V-Shop Admin' };

type TabKey = 'all' | OrderStatus;

type SearchParams = {
  status?: string;
  page?: string;
  shopId?: string;
  code?: string;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: OrderStatusValues.PENDING, label: 'Chờ xác nhận' },
  { key: OrderStatusValues.CONFIRMED, label: 'Đã xác nhận' },
  { key: OrderStatusValues.SHIPPING, label: 'Đang giao' },
  { key: OrderStatusValues.COMPLETED, label: 'Đã giao' },
  { key: OrderStatusValues.CANCELLED, label: 'Đã hủy' },
  { key: OrderStatusValues.REFUNDED, label: 'Đã hoàn tiền' },
];

const STATUS_STYLE: Record<string, string> = {
  [OrderStatusValues.CREATING]: 'bg-slate-100 text-slate-600 border-slate-200',
  [OrderStatusValues.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
  [OrderStatusValues.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
  [OrderStatusValues.SHIPPING]:
    'bg-indigo-100 text-indigo-700 border-indigo-200',
  [OrderStatusValues.COMPLETED]:
    'bg-emerald-100 text-emerald-700 border-emerald-200',
  [OrderStatusValues.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
  [OrderStatusValues.REFUNDED]:
    'bg-purple-100 text-purple-700 border-purple-200',
};

const STATUS_LABEL: Record<string, string> = {
  [OrderStatusValues.CREATING]: 'Đang tạo',
  [OrderStatusValues.PENDING]: 'Chờ xác nhận',
  [OrderStatusValues.CONFIRMED]: 'Đã xác nhận',
  [OrderStatusValues.SHIPPING]: 'Đang giao',
  [OrderStatusValues.COMPLETED]: 'Đã giao',
  [OrderStatusValues.CANCELLED]: 'Đã hủy',
  [OrderStatusValues.REFUNDED]: 'Đã hoàn tiền',
};

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function parseStatus(raw?: string): OrderStatus | undefined {
  if (!raw) return undefined;
  const ok = OrderStatusEnums.safeParse(raw);
  return ok.success ? ok.data : undefined;
}

function buildHref(opts: {
  status: TabKey;
  page?: number;
  shopId?: string;
  code?: string;
}): string {
  const sp = new URLSearchParams();
  if (opts.status !== 'all') sp.set('status', opts.status);
  if (opts.shopId) sp.set('shopId', opts.shopId);
  if (opts.code) sp.set('code', opts.code);
  if (opts.page && opts.page > 1) sp.set('page', String(opts.page));
  const qs = sp.toString();
  return qs ? `/orders?${qs}` : '/orders';
}

function formatCurrency(n: number): string {
  return (n ?? 0).toLocaleString('vi-VN') + 'đ';
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const status = parseStatus(sp.status);
  const shopId = (sp.shopId ?? '').trim();
  const code = (sp.code ?? '').trim();
  const activeKey: TabKey = status ?? 'all';
  const limit = 10;

  const data = await getSellerOrders({
    page,
    limit,
    status: status ?? null,
    shopId: shopId || undefined,
    code: code || undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý Đơn hàng</h1>
        <p className="text-ink-muted text-sm mt-1">
          Theo dõi và xử lý các đơn hàng của shop bạn. Tổng cộng{' '}
          {data.totalItems} đơn.
        </p>
      </div>

      {/* Tabs theo trạng thái */}
      <div className="card p-2 flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.key === activeKey;
          return (
            <Link
              key={t.key}
              href={buildHref({ status: t.key, shopId, code })}
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

      <form
        action="/orders"
        method="GET"
        className="card p-4 flex flex-col md:flex-row md:items-center gap-3"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            type="search"
            name="code"
            defaultValue={code}
            placeholder="Tìm theo mã đơn..."
            className="input pl-9"
          />
        </div>
        <input
          type="text"
          name="shopId"
          defaultValue={shopId}
          placeholder="Lọc theo shopId..."
          className="input w-full md:w-72"
        />
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
                <th className="py-3 px-4 text-left font-semibold w-[130px]">
                  ID
                </th>
                <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">
                  Mã đơn
                </th>
                <th className="py-3 px-4 text-left font-semibold">Sản phẩm</th>
                <th className="py-3 px-4 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                  Tạm tính
                </th>
                <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                  Giảm giá
                </th>
                <th className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                  Thành tiền
                </th>
                <th className="py-3 px-4 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
              {data.orders.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px]"
                        title={o.id}
                      >
                        {o.id.slice(0, 8)}…
                      </span>
                      <CopyButton value={o.id} label="Copy ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle whitespace-nowrap">
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {o.code}
                    </Link>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded bg-surface-muted border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {o.firstProductImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={o.firstProductImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-ink-subtle" />
                        )}
                      </div>
                      <span
                        className="text-sm text-ink line-clamp-2 max-w-xs"
                        title={o.firstProductName}
                      >
                        {o.firstProductName || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
                        STATUS_STYLE[o.status] ??
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right align-middle font-medium whitespace-nowrap">
                    {formatCurrency(o.itemTotal)}
                  </td>
                  <td className="py-3 px-4 text-right align-middle whitespace-nowrap">
                    <span className="text-success">
                      {formatCurrency(o.discount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right align-middle whitespace-nowrap">
                    <span className="font-bold text-primary">
                      {formatCurrency(o.grandTotal)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center align-middle">
                    <Link
                      href={`/orders/${o.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-muted hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
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
        buildHref={(n) =>
          buildHref({ status: activeKey, shopId, code, page: n })
        }
        ariaLabel="Phân trang đơn hàng"
      />
    </div>
  );
}
