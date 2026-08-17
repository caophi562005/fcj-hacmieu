import { formatCurrency, formatDateTime } from '@common/web-core/lib/format';
import { Pagination } from '@common/web-ui/index';
import { Clock3, LockKeyhole, WalletCards } from 'lucide-react';
import { getSettlements, getSettlementSummary } from '../../../lib/settlement';

type SearchParams = {
  page?: string;
  orderId?: string;
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
  FAILED: 'Chờ thử lại',
};

function pageNumber(raw?: string) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function href(sp: SearchParams, page: number) {
  const params = new URLSearchParams();
  Object.entries({ ...sp, page: page > 1 ? String(page) : undefined }).forEach(
    ([key, value]) => value && params.set(key, value),
  );
  const query = params.toString();
  return query ? `/finance/settlements?${query}` : '/finance/settlements';
}

export const metadata = { title: 'Khoản tiền sắp nhận — V-Shop Seller' };

export default async function SellerSettlementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = pageNumber(sp.page);
  const [summary, data] = await Promise.all([
    getSettlementSummary(),
    getSettlements({ ...sp, page, limit: 10 }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Khoản tiền sắp nhận</h1>
        <p className="text-ink-muted mt-1">
          Doanh thu được ghi có vào số dư sau 3 ngày kể từ khi đơn giao thành
          công.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<WalletCards />}
          label="Đang chờ ghi có"
          amount={summary.pendingAmount}
          note={`${summary.pendingCount} khoản`}
        />
        <SummaryCard
          icon={<Clock3 />}
          label="Sắp về trong 24 giờ"
          amount={summary.dueWithin24HoursAmount}
          note={`${summary.dueWithin24HoursCount} khoản`}
        />
        <SummaryCard
          icon={<LockKeyhole />}
          label="Đang tạm khóa"
          amount={summary.heldAmount}
          note={`${summary.heldCount} khoản cần kiểm tra`}
        />
      </div>
      {summary.nextAvailableAt && (
        <div className="card p-4 text-sm text-ink">
          Khoản gần nhất:{' '}
          <strong>{formatCurrency(summary.nextAvailableAmount)}</strong>, dự
          kiến vào lúc{' '}
          <strong>{formatDateTime(String(summary.nextAvailableAt))}</strong>.
        </div>
      )}
      <form
        action="/finance/settlements"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3"
      >
        <input
          name="orderId"
          defaultValue={sp.orderId}
          placeholder="Order ID"
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
          <option value="availableAt">Thời gian dự kiến</option>
          <option value="completedAt">Thời gian hoàn thành</option>
          <option value="netSellerAmount">Số tiền</option>
        </select>
        <div className="flex gap-2">
          <select
            name="sortOrder"
            defaultValue={sp.sortOrder ?? 'asc'}
            className="input"
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>
          <button className="btn-primary btn-md" type="submit">
            Lọc
          </button>
        </div>
      </form>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-surface-alt text-ink-muted border-b">
                <th className="p-4">Đơn hàng</th>
                <th className="p-4">Hoàn thành</th>
                <th className="p-4">Dự kiến ghi có</th>
                <th className="p-4 text-right">Thực nhận</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.settlements.map((item) => (
                <tr key={item.id} className="hover:bg-surface-alt">
                  <td className="p-4 font-medium">
                    #{item.orderId.slice(0, 8)}
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
                    <span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold">
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                    {item.status === 'HELD' && item.holdReason ? (
                      <p className="mt-1 text-xs text-ink-muted">
                        {item.holdReason}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!data.settlements.length && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-ink-muted">
                    Chưa có khoản tiền chờ ghi có.
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

function SummaryCard({
  icon,
  label,
  amount,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  amount: number;
  note: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-semibold text-ink-muted">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">
        {formatCurrency(amount)}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{note}</p>
    </div>
  );
}
