import {
  OrderStatusValues,
  type OrderStatus,
} from '@common/constants/order.constant';
import { Boxes, Clock3, Truck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { CopyButton } from '../components/CopyButton';
import { getSellerProducts } from '../lib/catalog';
import { getShopCredit, getShopRevenueSummary } from '../lib/credit';
import { formatCurrency } from '../lib/mockData';
import { getSellerOrders } from '../lib/order';

export default async function DashboardPage() {
  const [
    credit,
    pendingOrders,
    shippingOrders,
    products,
    recentOrders,
    revenue,
  ] = await Promise.all([
    getShopCredit(),
    getSellerOrders({ page: 1, limit: 1, status: OrderStatusValues.PENDING }),
    getSellerOrders({
      page: 1,
      limit: 1,
      status: OrderStatusValues.SHIPPING,
    }),
    getSellerProducts({ page: 1, limit: 1 }),
    getSellerOrders({ page: 1, limit: 5 }),
    getShopRevenueSummary(7),
  ]);

  const latestOrders = recentOrders.orders ?? [];
  const revenue7Days = revenue.points.map((p) => ({
    day: p.date.slice(5),
    value: p.amount,
  }));
  const maxRev = Math.max(1, ...revenue7Days.map((d) => d.value));

  const shortenOrderCode = (code: string) => {
    if (!code || code.length <= 12) return code;
    return `${code.slice(0, 8)}…${code.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          label="Số dư ví"
          value={formatCurrency(credit?.balance ?? 0)}
        />
        <StatCard
          icon={Clock3}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Đơn chờ xác nhận"
          value={String(pendingOrders.totalItems ?? 0)}
        />
        <StatCard
          icon={Truck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Đơn đang giao"
          value={String(shippingOrders.totalItems ?? 0)}
        />
        <StatCard
          icon={Boxes}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Số sản phẩm"
          value={String(products.totalItems ?? 0)}
        />
      </div>

      {/* Chart + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink">
              Doanh thu 7 ngày gần nhất
            </h3>
            <Link
              href="/finance"
              className="text-primary text-sm font-semibold hover:underline"
            >
              Xem chi tiết
            </Link>
          </div>
          <div className="h-[300px] w-full border-b border-l border-slate-200 flex items-end justify-between px-4">
            {revenue7Days.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div
                  className="w-10 bg-primary/70 hover:bg-primary rounded-t-sm transition-colors"
                  style={{ height: `${(d.value / maxRev) * 240}px` }}
                  title={`${d.day}: ${d.value}`}
                />
                <span className="text-xs text-ink-muted">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">
              Đơn hàng mới nhất
            </h3>
            <Link
              href="/orders"
              className="text-primary text-sm font-semibold hover:underline"
            >
              Tất cả
            </Link>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-ink-muted">
                  <th className="py-2.5 px-2 text-left font-semibold">Mã</th>
                  <th className="py-2.5 px-2 text-left font-semibold">
                    Sản phẩm
                  </th>
                  <th className="py-2.5 px-2 text-right font-semibold">Tổng</th>
                  <th className="py-2.5 px-2 text-center font-semibold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-surface-alt transition-colors"
                  >
                    <td className="py-2.5 px-2 font-medium text-ink">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/orders/${o.id}`}
                          className="font-semibold text-ink hover:text-primary transition-colors cursor-pointer"
                          title={o.code}
                        >
                          #{shortenOrderCode(o.code)}
                        </Link>
                        <CopyButton
                          value={o.code}
                          label="Copy mã đơn"
                          className="relative z-10"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-ink-muted truncate max-w-[120px]">
                      <Link
                        href={`/orders/${o.id}`}
                        className="block text-ink-muted hover:text-ink transition-colors cursor-pointer"
                        title={o.firstProductName}
                      >
                        {o.firstProductName}
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium">
                      <Link
                        href={`/orders/${o.id}`}
                        className="block hover:text-primary transition-colors cursor-pointer"
                      >
                        {formatCurrency(o.grandTotal)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex cursor-pointer"
                      >
                        <StatusBadge status={o.status as OrderStatus} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {latestOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 px-2 text-center text-sm text-ink-muted"
                    >
                      Chưa có đơn hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5 hover:shadow-floating transition-shadow">
      <div
        className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor} mb-4`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <h2 className="text-2xl font-bold text-ink">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { cls: string; label: string }> = {
    CREATING: {
      cls: 'bg-slate-100 text-slate-700',
      label: 'Đang tạo',
    },
    PENDING: {
      cls: 'bg-orange-100 text-orange-800',
      label: 'Chờ xác nhận',
    },
    CONFIRMED: {
      cls: 'bg-blue-100 text-blue-800',
      label: 'Đã xác nhận',
    },
    SHIPPING: {
      cls: 'bg-indigo-100 text-indigo-800',
      label: 'Đang giao',
    },
    COMPLETED: {
      cls: 'bg-emerald-100 text-emerald-800',
      label: 'Đã giao',
    },
    CANCELLED: {
      cls: 'bg-red-100 text-red-800',
      label: 'Đã hủy',
    },
    REFUNDED: {
      cls: 'bg-purple-100 text-purple-800',
      label: 'Đã hoàn tiền',
    },
  };
  const current = map[status] ?? {
    cls: 'bg-slate-100 text-slate-700',
    label: status,
  };
  return <span className={`chip ${current.cls}`}>{current.label}</span>;
}
