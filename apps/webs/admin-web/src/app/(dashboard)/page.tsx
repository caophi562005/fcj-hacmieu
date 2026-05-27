import { OrderStatusValues } from '@common/constants/order.constant';
import { PayoutStatusValues } from '@common/constants/payout.constant';
import { ReportStatusValues } from '@common/constants/report.constant';
import { CopyButton } from '@common/web-ui/index';
import {
  AlertOctagon,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { getManyUsers } from '../../lib/admin-iam';
import {
  getManyMerchants,
  getManyPayouts,
  getManyShops,
} from '../../lib/admin-shop-wallet';
import { getManyReports } from '../../lib/admin-utility';
import { isUnauthorizedError } from '../../lib/api';
import { getSellerOrders } from '../../lib/order';

export default async function DashboardPage() {
  let users;
  let activeShops;
  let pendingMerchants;
  let pendingPayouts;
  let pendingReports;
  let pendingOrders;
  let recentReports;

  try {
    [
      users,
      activeShops,
      pendingMerchants,
      pendingPayouts,
      pendingReports,
      pendingOrders,
      recentReports,
    ] = await Promise.all([
      getManyUsers({ page: 1, limit: 1 }),
      getManyShops({ page: 1, limit: 1, status: 'ACTIVE' }),
      getManyMerchants({ page: 1, limit: 1, approvalStatus: 'PENDING' }),
      getManyPayouts({
        page: 1,
        limit: 1,
        status: PayoutStatusValues.PENDING,
      }),
      getManyReports({
        page: 1,
        limit: 1,
        status: ReportStatusValues.PENDING,
      }),
      getSellerOrders({
        page: 1,
        limit: 1,
        status: OrderStatusValues.PENDING,
      }),
      getManyReports({ page: 1, limit: 5 }),
    ]);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return <UnauthorizedState />;
    }
    throw error;
  }

  const queueMetrics = [
    {
      label: 'Merchant chờ duyệt',
      value: pendingMerchants.totalItems ?? 0,
      href: '/merchant?approvalStatus=PENDING',
      tone: 'bg-blue-500',
    },
    {
      label: 'Payout chờ xử lý',
      value: pendingPayouts.totalItems ?? 0,
      href: '/payouts?status=PENDING',
      tone: 'bg-indigo-500',
    },
    {
      label: 'Report chờ xử lý',
      value: pendingReports.totalItems ?? 0,
      href: '/reports?status=PENDING',
      tone: 'bg-orange-500',
    },
    {
      label: 'Đơn chờ xác nhận',
      value: pendingOrders.totalItems ?? 0,
      href: '/orders?status=PENDING',
      tone: 'bg-emerald-500',
    },
  ] as const;
  const maxQueue = Math.max(1, ...queueMetrics.map((item) => item.value));

  const latestReports = recentReports.reports ?? [];

  const actionItems = [
    {
      title: 'Duyệt hồ sơ merchant',
      value: pendingMerchants.totalItems ?? 0,
      href: '/merchant?approvalStatus=PENDING',
    },
    {
      title: 'Xử lý payout',
      value: pendingPayouts.totalItems ?? 0,
      href: '/payouts?status=PENDING',
    },
    {
      title: 'Xử lý báo cáo vi phạm',
      value: pendingReports.totalItems ?? 0,
      href: '/reports?status=PENDING',
    },
    {
      title: 'Theo dõi đơn chờ xác nhận',
      value: pendingOrders.totalItems ?? 0,
      href: '/orders?status=PENDING',
    },
  ] as const;

  const shortenId = (value: string) => {
    if (!value || value.length <= 12) return value;
    return `${value.slice(0, 8)}…${value.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Dashboard quản trị</h1>
        <p className="text-ink-muted text-sm mt-1">
          Theo dõi tổng quan vận hành hệ thống và xử lý nhanh các đầu việc ưu
          tiên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          icon={UserRound}
          iconBg="bg-primary-50"
          iconColor="text-primary"
          label="Tổng tài khoản"
          value={formatCount(users.totalItems ?? 0)}
        />
        <StatCard
          icon={Store}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Shop đang hoạt động"
          value={formatCount(activeShops.totalItems ?? 0)}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Merchant chờ duyệt"
          value={formatCount(pendingMerchants.totalItems ?? 0)}
        />
        <StatCard
          icon={ClipboardCheck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          label="Payout chờ xử lý"
          value={formatCount(pendingPayouts.totalItems ?? 0)}
        />
        <StatCard
          icon={AlertOctagon}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          label="Report chờ xử lý"
          value={formatCount(pendingReports.totalItems ?? 0)}
        />
        <StatCard
          icon={Clock3}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
          label="Đơn chờ xác nhận"
          value={formatCount(pendingOrders.totalItems ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">
              Khối lượng hàng đợi xử lý
            </h3>
          </div>

          <div className="h-[300px] w-full border-b border-l border-slate-200 flex items-end justify-between px-4">
            {queueMetrics.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div
                  className={`w-10 ${item.tone} rounded-t-sm transition-opacity hover:opacity-80`}
                  style={{ height: `${(item.value / maxQueue) * 240}px` }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-xs text-ink-muted text-center leading-tight">
                  {item.label}
                </span>
                <Link
                  href={item.href}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  {formatCount(item.value)}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 card p-5 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">
              Việc cần xử lý ngay
            </h3>
          </div>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3.5 py-3 hover:bg-surface-alt transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-ink">
                  {item.title}
                </span>
                <span className="chip bg-primary-50 text-primary">
                  {formatCount(item.value)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-ink">Báo cáo mới nhất</h3>
          <Link
            href="/reports"
            className="text-primary text-sm font-semibold hover:underline cursor-pointer"
          >
            Tất cả báo cáo
          </Link>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted text-ink-muted">
                <th className="py-2.5 px-3 text-left font-semibold">ID</th>
                <th className="py-2.5 px-3 text-left font-semibold">Tiêu đề</th>
                <th className="py-2.5 px-3 text-left font-semibold">
                  Danh mục
                </th>
                <th className="py-2.5 px-3 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="py-2.5 px-3 text-left font-semibold">Tạo lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {latestReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-2.5 px-3 align-middle">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px] hover:text-primary transition-colors cursor-pointer"
                        title={report.id}
                      >
                        {report.id.slice(0, 8)}…
                      </Link>
                      <CopyButton value={report.id} label="Copy report ID" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-ink max-w-[360px] truncate">
                    <Link
                      href={`/reports/${report.id}`}
                      className="hover:text-primary transition-colors cursor-pointer"
                      title={report.title}
                    >
                      {report.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-ink-muted">
                    {report.category}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <ReportStatusBadge status={report.status} />
                  </td>
                  <td className="py-2.5 px-3 text-ink-muted whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {latestReports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 px-3 text-center text-sm text-ink-muted"
                  >
                    Chưa có báo cáo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatCount(value: number) {
  return value.toLocaleString('vi-VN');
}

function UnauthorizedState() {
  return (
    <section className="card p-8 md:p-10 max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-ink">
        Bạn chưa đăng nhập
      </h1>
      <p className="text-sm text-ink-muted">
        Phiên đăng nhập chưa có hoặc đã hết hạn. Vui lòng đăng nhập để truy cập
        trang quản trị.
      </p>
      <div className="pt-2 flex justify-center">
        <Link href="/login" className="btn-primary btn-md">
          Đăng nhập
        </Link>
      </div>
    </section>
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

function ReportStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    PENDING: {
      cls: 'bg-orange-100 text-orange-800',
      label: 'Chờ xử lý',
    },
    REVIEWING: {
      cls: 'bg-blue-100 text-blue-800',
      label: 'Đang xem xét',
    },
    RESOLVED: {
      cls: 'bg-emerald-100 text-emerald-800',
      label: 'Đã xử lý',
    },
    REJECTED: {
      cls: 'bg-red-100 text-red-800',
      label: 'Từ chối',
    },
  };
  const current = map[status] ?? {
    cls: 'bg-slate-100 text-slate-700',
    label: status,
  };
  return <span className={`chip ${current.cls}`}>{current.label}</span>;
}
