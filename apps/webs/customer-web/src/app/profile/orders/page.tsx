import {
  OrderStatus,
  OrderStatusValues,
} from '@common/constants/order.constant';
import {
  PaymentMethodValues,
  PaymentStatusValues,
} from '@common/constants/payment.constant';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '../../../components/Pagination';
import { formatVnd } from '../../../components/ProductCard';
import { getMyOrders } from '../../../lib/order';

type TabKey =
  | 'all'
  | 'pending'
  | 'shipping'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

type SearchParams = {
  tab?: TabKey;
  page?: string;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'confirmed', label: 'Chờ giao hàng' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'refunded', label: 'Trả hàng' },
];

const STATUS_BADGE: Record<string, string> = {
  [OrderStatusValues.CREATING]: 'bg-surface-muted text-ink-muted',
  [OrderStatusValues.PENDING]: 'bg-warning/10 text-warning',
  [OrderStatusValues.CONFIRMED]: 'bg-secondary/15 text-primary',
  [OrderStatusValues.SHIPPING]: 'bg-accent text-accent-foreground',
  [OrderStatusValues.COMPLETED]: 'bg-success/10 text-success',
  [OrderStatusValues.CANCELLED]: 'bg-danger/10 text-danger',
  [OrderStatusValues.REFUNDED]: 'bg-danger/10 text-danger',
};

function parsePage(raw?: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function statusFromTab(tab: TabKey): OrderStatus | null {
  switch (tab) {
    case 'pending':
      return OrderStatusValues.PENDING;
    case 'shipping':
      return OrderStatusValues.SHIPPING;
    case 'confirmed':
      return OrderStatusValues.CONFIRMED;
    case 'completed':
      return OrderStatusValues.COMPLETED;
    case 'cancelled':
      return OrderStatusValues.CANCELLED;
    case 'refunded':
      return OrderStatusValues.REFUNDED;
    default:
      return null;
  }
}

function statusLabel(
  status: string,
  paymentMethod?: string,
  paymentStatus?: string,
): string {
  switch (status) {
    case OrderStatusValues.CREATING:
      return 'Đang tạo';
    case OrderStatusValues.PENDING:
      if (
        paymentMethod === PaymentMethodValues.WALLET &&
        paymentStatus === PaymentStatusValues.PENDING
      ) {
        return 'Chờ thanh toán';
      }
      return 'Chờ xác nhận';
    case OrderStatusValues.CONFIRMED:
      return 'Chờ giao hàng';
    case OrderStatusValues.SHIPPING:
      return 'Đang giao';
    case OrderStatusValues.COMPLETED:
      return 'Hoàn thành';
    case OrderStatusValues.CANCELLED:
      return 'Đã hủy';
    case OrderStatusValues.REFUNDED:
      return 'Đã hoàn tiền';
    default:
      return status;
  }
}

function formatDate(raw: unknown): string {
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('vi-VN');
}

function buildHref(tab: TabKey, page: number): string {
  const params = new URLSearchParams();
  if (tab !== 'all') params.set('tab', tab);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : '?';
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const tab: TabKey = TABS.some((t) => t.key === sp.tab)
    ? (sp.tab as TabKey)
    : 'all';
  const page = parsePage(sp.page);
  const limit = 10;

  const data = await getMyOrders({
    page,
    limit,
    status: statusFromTab(tab),
  });

  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <>
      <div className="card p-2 mb-4 sticky top-16 z-10">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={buildHref(t.key, 1)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-muted hover:text-primary'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-3 mb-4 flex items-center h-11 rounded border border-border focus-within:border-primary">
        <Search className="w-4 h-4 text-ink-subtle ml-2" />
        <input
          className="flex-1 bg-transparent border-0 outline-none px-3 text-sm"
          placeholder="Tìm theo Mã đơn, Sản phẩm…"
        />
      </div>

      <div className="space-y-3">
        {data.orders.map((o) => {
          const hasDiscount = o.discount > 0;
          return (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-surface-alt border-b border-border-subtle">
                <div className="text-xs text-ink-muted">
                  Mã đơn:{' '}
                  <span className="font-semibold text-ink">{o.code}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    STATUS_BADGE[o.status] ?? 'bg-surface-muted text-ink-muted'
                  }`}
                >
                  {statusLabel(o.status, o.paymentMethod, o.paymentStatus)}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.firstProductImage || '/placeholder.png'}
                    alt={o.firstProductName || o.code}
                    className="w-16 h-16 rounded object-cover bg-surface-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2">
                      {o.firstProductName || 'Sản phẩm trong đơn hàng'}
                    </div>
                    <div className="text-xs text-ink-subtle mt-1">
                      Ngày đặt: {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatVnd(o.itemTotal)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-surface-alt border-t border-border-subtle">
                <div className="text-sm text-ink-muted mr-auto">
                  {hasDiscount && (
                    <span className="mr-2">Giảm: -{formatVnd(o.discount)}</span>
                  )}
                  Thành tiền:{' '}
                  <span className="text-primary font-bold text-lg">
                    {formatVnd(o.grandTotal)}
                  </span>
                </div>
                <Link
                  href={`/profile/orders/${o.id}`}
                  className="btn-outline btn-sm cursor-pointer"
                >
                  Xem chi tiết
                </Link>
                {o.status === OrderStatusValues.COMPLETED && (
                  <button className="btn-primary btn-sm cursor-pointer">
                    Mua lại
                  </button>
                )}
                {o.status === OrderStatusValues.PENDING &&
                  o.paymentMethod === PaymentMethodValues.WALLET &&
                  o.paymentStatus === PaymentStatusValues.PENDING && (
                    <button className="btn-primary btn-sm cursor-pointer">
                      Thanh toán
                    </button>
                  )}
              </div>
            </div>
          );
        })}

        {data.orders.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm text-ink-muted">Bạn chưa có đơn hàng nào.</p>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref(tab, n)}
        ariaLabel="Phân trang đơn hàng"
      />
    </>
  );
}
