import { AlertTriangle, Clock3, Truck, Wallet } from 'lucide-react';
import Link from 'next/link';
import {
  dashboardStats,
  formatCurrency,
  mockOrders,
  ORDER_STATUS_LABEL,
  revenue7Days,
  type OrderStatus,
} from '../lib/mockData';

export default function DashboardPage() {
  const recentOrders = mockOrders.slice(0, 5);
  const maxRev = Math.max(...revenue7Days.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          label="Số dư ví"
          value={formatCurrency(dashboardStats.walletBalance)}
        />
        <StatCard
          icon={Clock3}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Đơn chờ xác nhận"
          value={String(dashboardStats.pendingOrders)}
        />
        <StatCard
          icon={Truck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Đơn đang giao"
          value={String(dashboardStats.shippingOrders)}
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Sản phẩm hết hàng"
          value={String(dashboardStats.outOfStock)}
        />
      </div>

      {/* Chart + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 card p-5">
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

        <section className="card p-5 flex flex-col">
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
                  <th className="py-2.5 px-2 text-left font-semibold">Khách</th>
                  <th className="py-2.5 px-2 text-right font-semibold">Tổng</th>
                  <th className="py-2.5 px-2 text-center font-semibold">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-surface-alt transition-colors"
                  >
                    <td className="py-2.5 px-2 font-medium text-ink">
                      #{o.code}
                    </td>
                    <td className="py-2.5 px-2 text-ink-muted truncate max-w-[120px]">
                      {o.customerName}
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
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
  const map: Record<OrderStatus, string> = {
    pending: 'bg-orange-100 text-orange-800',
    processing: 'bg-blue-100 text-blue-800',
    shipping: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`chip ${map[status]}`}>{ORDER_STATUS_LABEL[status]}</span>
  );
}
