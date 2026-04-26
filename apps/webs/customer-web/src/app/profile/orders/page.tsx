import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatVnd } from '../../../components/ProductCard';
import { PRODUCTS } from '../../../components/mockData';

const TABS = [
  'Tất cả',
  'Chờ thanh toán',
  'Vận chuyển',
  'Chờ giao hàng',
  'Hoàn thành',
  'Đã hủy',
  'Trả hàng',
];

const STATUS_BADGE: Record<string, string> = {
  'Đang giao': 'bg-accent text-accent-foreground',
  'Hoàn thành': 'bg-success/10 text-success',
  'Chờ thanh toán': 'bg-warning/10 text-warning',
  'Đã hủy': 'bg-danger/10 text-danger',
};

const ORDERS = [
  { id: 'DH202401234', status: 'Hoàn thành', items: PRODUCTS.slice(0, 2) },
  { id: 'DH202401221', status: 'Đang giao', items: PRODUCTS.slice(2, 4) },
  { id: 'DH202401199', status: 'Chờ thanh toán', items: PRODUCTS.slice(4, 5) },
  { id: 'DH202401150', status: 'Đã hủy', items: PRODUCTS.slice(5, 6) },
];

export default function OrdersPage() {
  return (
    <>
      <div className="card p-2 mb-4 sticky top-16 z-10">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                i === 0
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-muted hover:text-primary'
              }`}
            >
              {t}
            </button>
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
        {ORDERS.map((o) => {
          const total = o.items.reduce((s, p) => s + p.price, 0);
          return (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-surface-alt border-b border-border-subtle">
                <div className="text-xs text-ink-muted">
                  Mã đơn: <span className="font-semibold text-ink">{o.id}</span>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    STATUS_BADGE[o.status] ?? 'bg-surface-muted text-ink'
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {o.items.map((p) => (
                  <div key={p.id} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover bg-surface-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm line-clamp-2">{p.name}</div>
                      <div className="text-xs text-ink-subtle mt-1">x1</div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {formatVnd(p.price)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-surface-alt border-t border-border-subtle">
                <div className="text-sm text-ink-muted mr-auto">
                  Thành tiền:{' '}
                  <span className="text-primary font-bold text-lg">
                    {formatVnd(total)}
                  </span>
                </div>
                <Link
                  href={`/profile/orders/${o.id}`}
                  className="btn-outline btn-sm"
                >
                  Xem chi tiết
                </Link>
                {o.status === 'Hoàn thành' && (
                  <button className="btn-primary btn-sm">Mua lại</button>
                )}
                {o.status === 'Chờ thanh toán' && (
                  <button className="btn-primary btn-sm">Thanh toán</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
