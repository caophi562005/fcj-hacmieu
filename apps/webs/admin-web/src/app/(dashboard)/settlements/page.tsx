import { formatCurrency, formatDateTime } from '@common/web-core/lib/format';
import { Pagination } from '@common/web-ui/index';
import { AlertTriangle, Clock3, LockKeyhole, WalletCards } from 'lucide-react';
import {
  getAdminSettlements,
  getAdminSettlementSummary,
} from '../../../lib/admin-settlement';
import { SettlementActions } from './ui';

type SearchParams = {
  page?: string;
  orderId?: string;
  shopId?: string;
  status?: string;
  availableFrom?: string;
  availableTo?: string;
  sortBy?: string;
  sortOrder?: string;
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ',
  PROCESSING: 'Đang ghi có',
  SETTLED: 'Đã ghi có',
  HELD: 'Tạm khóa',
  CANCELLED: 'Đã hủy',
  FAILED: 'Lỗi - chờ thử lại',
};
const number = (raw?: string) =>
  raw && Number.isFinite(Number(raw)) ? Number(raw) : undefined;
const pageNumber = (raw?: string) => Math.max(1, Math.floor(number(raw) ?? 1));

function href(sp: SearchParams, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...sp, page: page > 1 ? String(page) : undefined }).forEach(
    ([key, value]) => value && params.set(key, value),
  );
  const query = params.toString();
  return query ? `/settlements?${query}` : '/settlements';
}

export const metadata = { title: 'Đối soát Seller — V-Shop Admin' };

export default async function SettlementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = pageNumber(sp.page);
  const query = {
    page,
    limit: 10,
    orderId: sp.orderId,
    shopId: sp.shopId,
    status: sp.status,
    availableFrom: sp.availableFrom,
    availableTo: sp.availableTo,
    sortBy: sp.sortBy,
    sortOrder: sp.sortOrder,
  };
  const [summary, data] = await Promise.all([
    getAdminSettlementSummary(sp.shopId),
    getAdminSettlements(query),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">
          Đối soát khoản tiền Seller
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Theo dõi khoản sắp ghi có và khóa thủ công khi cần kiểm tra giao dịch.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Summary
          icon={<WalletCards />}
          label="Đang chờ"
          amount={summary.pendingAmount}
          count={summary.pendingCount}
        />
        <Summary
          icon={<Clock3 />}
          label="Đến hạn trong 24h"
          amount={summary.dueWithin24HoursAmount}
          count={summary.dueWithin24HoursCount}
        />
        <Summary
          icon={<LockKeyhole />}
          label="Đang khóa"
          amount={summary.heldAmount}
          count={summary.heldCount}
        />
        <Summary
          icon={<AlertTriangle />}
          label="Đang lỗi"
          amount={summary.failedAmount}
          count={summary.failedCount}
        />
      </div>
      <form
        action="/settlements"
        method="GET"
        className="card p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
      >
        <input
          name="orderId"
          defaultValue={sp.orderId}
          placeholder="Order ID"
          className="input"
        />
        <input
          name="shopId"
          defaultValue={sp.shopId}
          placeholder="Shop ID"
          className="input"
        />
        <select name="status" defaultValue={sp.status ?? ''} className="input">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Dự kiến nhận từ
          <input
            type="date"
            name="availableFrom"
            defaultValue={sp.availableFrom}
            className="input w-full"
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink-muted">
          Dự kiến nhận đến
          <input
            type="date"
            name="availableTo"
            defaultValue={sp.availableTo}
            className="input w-full"
          />
        </label>
        <select
          name="sortBy"
          defaultValue={sp.sortBy ?? 'availableAt'}
          className="input"
        >
          <option value="availableAt">Ngày dự kiến</option>
          <option value="completedAt">Ngày hoàn thành</option>
          <option value="netSellerAmount">Số tiền</option>
          <option value="createdAt">Ngày tạo</option>
        </select>
        <select
          name="sortOrder"
          defaultValue={sp.sortOrder ?? 'asc'}
          className="input"
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
        <button type="submit" className="btn-primary btn-md">
          Lọc dữ liệu
        </button>
      </form>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-surface-alt text-ink-muted border-b">
                <th className="p-4">Đơn hàng / Shop</th>
                <th className="p-4">Hoàn thành</th>
                <th className="p-4">Dự kiến</th>
                <th className="p-4 text-right">Thực nhận</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.settlements.map((item) => (
                <tr key={item.id} className="hover:bg-surface-alt">
                  <td className="p-4">
                    <p className="font-medium">#{item.orderId}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      Shop: {item.shopId}
                    </p>
                  </td>
                  <td className="p-4">
                    {formatDateTime(String(item.completedAt))}
                  </td>
                  <td className="p-4">
                    {formatDateTime(String(item.availableAt))}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {formatCurrency(item.netSellerAmount)}
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border px-2.5 py-1 text-xs font-semibold">
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                    {item.holdReason && (
                      <p className="mt-2 max-w-xs text-xs text-ink-muted">
                        {item.holdReason}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <SettlementActions id={item.id} status={item.status} />
                  </td>
                </tr>
              ))}
              {!data.settlements.length && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-ink-muted">
                    Không tìm thấy khoản ghi có.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination
        page={page}
        totalPages={Math.max(data.totalPages, 1)}
        buildHref={(next) => href(sp, next)}
      />
    </div>
  );
}

function Summary({
  icon,
  label,
  amount,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  count: number;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-semibold text-ink-muted">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">
        {formatCurrency(amount)}
      </p>
      <p className="text-sm text-ink-muted mt-1">{count} khoản</p>
    </div>
  );
}
