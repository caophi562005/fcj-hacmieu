import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Filter,
  ImageIcon,
  Printer,
  Search,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  mockOrders,
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from '../../lib/mockData';

export const metadata = { title: 'Quản lý Đơn hàng — V-Shop Seller' };

const TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const pendingCount = mockOrders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý Đơn hàng</h1>
        <p className="text-ink-muted text-sm mt-1">
          Theo dõi và xử lý các đơn hàng của shop bạn.
        </p>
      </div>

      {/* Tabs */}
      <div className="card p-2 flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.key === 'all';
          return (
            <button
              key={t.key}
              type="button"
              className={`px-5 py-2 rounded text-sm font-semibold whitespace-nowrap transition-colors relative ${
                isActive
                  ? 'bg-primary-50 text-primary'
                  : 'text-ink-muted hover:bg-surface-muted'
              }`}
            >
              {t.label}
              {t.key === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <label htmlFor="order-code" className="label-field text-xs uppercase tracking-wider">
            Mã đơn hàng
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
            <input id="order-code" type="search" placeholder="Nhập mã đơn..." className="input pl-9" />
          </div>
        </div>
        <div className="card p-5">
          <label htmlFor="customer" className="label-field text-xs uppercase tracking-wider">
            Tên khách hàng
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
            <input id="customer" type="search" placeholder="Nhập tên khách..." className="input pl-9" />
          </div>
        </div>
        <div className="card p-5 md:col-span-2">
          <label className="label-field text-xs uppercase tracking-wider">
            Khoảng ngày đặt hàng
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
              <input type="date" className="input pl-9" aria-label="Từ ngày" />
            </div>
            <span className="text-ink-subtle">–</span>
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
              <input type="date" className="input pl-9" aria-label="Đến ngày" />
            </div>
            <button type="button" className="btn-primary btn-md shrink-0">
              <Filter className="w-4 h-4" />
              <span>Lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order cards */}
      <div className="flex flex-col gap-4">
        {mockOrders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="card overflow-hidden hover:shadow-floating transition-shadow">
      {/* Header */}
      <header className="bg-surface-alt px-5 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink-muted">Mã ĐH:</span>
            <span className="text-base font-bold text-primary cursor-pointer hover:underline">
              #{order.code}
            </span>
          </div>
          <span className="w-px h-4 bg-slate-200" aria-hidden />
          <time
            dateTime={order.createdAt}
            className="text-sm text-ink-muted flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            {formatDateTime(order.createdAt)}
          </time>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* Body */}
      <div className="p-5 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          {order.items.map((it, idx) => (
            <div
              key={idx}
              className={idx > 0 ? 'pt-4 border-t border-slate-100 flex gap-4' : 'flex gap-4'}
            >
              <div className="w-20 h-20 rounded-md bg-surface-muted border border-slate-200 flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6 text-ink-subtle" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink line-clamp-2">
                    {it.name}
                  </h3>
                  {it.variant && (
                    <p className="text-sm text-ink-muted mt-0.5">
                      Phân loại: {it.variant}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-ink">x{it.quantity}</span>
                  <span className="text-sm font-medium text-ink-muted">
                    {formatCurrency(it.price)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:w-64 md:border-l md:border-slate-100 md:pl-6 flex flex-col justify-center gap-2">
          <Row
            label="Tổng thanh toán"
            value={
              <span className="text-lg font-bold text-ink">
                {formatCurrency(order.total)}
              </span>
            }
          />
          <Row
            label="Thanh toán"
            value={
              <span className="text-sm text-ink flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-ink-subtle" />
                {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : order.paymentMethod}
              </span>
            }
          />
          <Row
            label="Trạng thái"
            value={
              order.paymentStatus === 'paid' ? (
                <span className="text-sm text-success flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Đã thanh toán
                </span>
              ) : (
                <span className="text-sm text-ink-muted">Chưa thanh toán</span>
              )
            }
          />
        </div>
      </div>

      {/* Actions */}
      <footer className="bg-surface-alt px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
        {order.status === 'pending' && (
          <>
            <button type="button" className="btn-outline btn-sm">
              <XCircle className="w-4 h-4" />
              Hủy đơn
            </button>
            <button type="button" className="btn-primary btn-sm">
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận đơn
            </button>
          </>
        )}
        {(order.status === 'processing' || order.status === 'shipping') && (
          <button
            type="button"
            className="btn btn-sm bg-white border border-primary text-primary hover:bg-primary-50"
          >
            <Printer className="w-4 h-4" />
            In vận đơn
          </button>
        )}
        {order.status === 'delivered' && (
          <span className="text-sm text-ink-muted">Đơn hàng đã hoàn tất.</span>
        )}
        {order.status === 'cancelled' && (
          <span className="text-sm text-danger">Đơn hàng đã bị hủy.</span>
        )}
      </footer>
    </article>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}:</span>
      {value}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipping: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${map[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
