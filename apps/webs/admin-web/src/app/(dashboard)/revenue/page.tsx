import { CopyButton, Pagination } from '@common/web-ui/index';
import {
  Building2,
  Clock3,
  DollarSign,
  Download,
  Filter,
  Receipt,
  Scale,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import {
  getPlatformLedgerList,
  getPlatformRevenueSummary,
} from '../../../lib/admin-shop-wallet';
import { getAdminSettlementSummary } from '../../../lib/admin-settlement';

type SearchParams = {
  page?: string;
  shopId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'grossAmount' | 'commissionFee';
  sortOrder?: 'asc' | 'desc';
};

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: {
  page?: number;
  shopId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const sp = new URLSearchParams();
  if (query.shopId) sp.set('shopId', query.shopId);
  if (query.startDate) sp.set('startDate', query.startDate);
  if (query.endDate) sp.set('endDate', query.endDate);
  if (query.sortBy) sp.set('sortBy', query.sortBy);
  if (query.sortOrder) sp.set('sortOrder', query.sortOrder);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/revenue?${qs}` : '/revenue';
}

function formatVND(amount: number) {
  return (amount ?? 0).toLocaleString('vi-VN') + ' đ';
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const shopId = (sp.shopId ?? '').trim();
  const startDate = (sp.startDate ?? '').trim();
  const endDate = (sp.endDate ?? '').trim();
  const sortBy = sp.sortBy || 'createdAt';
  const sortOrder = sp.sortOrder || 'desc';

  const [summary, ledgerRes, settlementSummary] = await Promise.all([
    getPlatformRevenueSummary({
      shopId: shopId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    getPlatformLedgerList({
      page,
      limit: 10,
      shopId: shopId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    }),
    getAdminSettlementSummary(shopId || undefined),
  ]);

  const items = ledgerRes.items || [];
  const totalPages = Math.max(ledgerRes.totalPages || 1, 1);

  // Link xuất file Excel/CSV từ admin-bff
  const exportUrl = `${process.env.ADMIN_BFF_URL || 'http://localhost:3300'}/api/v1/admin/revenue/export-excel?${new URLSearchParams({
    ...(shopId ? { shopId } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">
            Báo cáo Doanh thu & Thuế Sàn
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            Thống kê doanh số giao dịch (GMV), hoa hồng sàn (5%), thuế trích nộp thay (1.5%) &amp; sổ cái tài chính.
          </p>
        </div>

        <a
          href={exportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-md inline-flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel/CSV</span>
        </a>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Tổng GMV"
          subtitle="Tổng doanh số bán lẻ"
          value={formatVND(summary.totalGMV)}
          icon={TrendingUp}
          tone="bg-blue-500/10 text-blue-600"
        />
        <KpiCard
          title="Hoa hồng Sàn (5%)"
          subtitle="Doanh thu dịch vụ sàn"
          value={formatVND(summary.totalCommission)}
          icon={DollarSign}
          tone="bg-emerald-500/10 text-emerald-600"
        />
        <KpiCard
          title="Thuế Nộp Thay (1.5%)"
          subtitle="GTGT &amp; TNCN nộp TCT"
          value={formatVND(summary.totalTaxWithheld)}
          icon={Scale}
          tone="bg-purple-500/10 text-purple-600"
        />
        <KpiCard
          title="Thực Nhận Seller"
          subtitle="Dòng tiền đổ vào ví shop"
          value={formatVND(summary.totalNetSellerAmount)}
          icon={Building2}
          tone="bg-amber-500/10 text-amber-600"
        />
        <KpiCard
          title="Payout Chờ Xử Lý"
          subtitle="Tổng tiền shop xin rút"
          value={formatVND(summary.totalPendingPayouts)}
          icon={Receipt}
          tone="bg-rose-500/10 text-rose-600"
        />
        <Link href={shopId ? `/settlements?shopId=${shopId}` : '/settlements'}>
          <KpiCard
            title="Chờ ghi có Seller"
            subtitle={`${settlementSummary.pendingCount} khoản đang chờ`}
            value={formatVND(settlementSummary.pendingAmount)}
            icon={Clock3}
            tone="bg-orange-500/10 text-orange-600"
          />
        </Link>
      </div>

      {/* Filter and Control Bar */}
      <form
        action="/revenue"
        method="GET"
        className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">
            Lọc theo Shop ID
          </label>
          <input
            name="shopId"
            defaultValue={shopId}
            placeholder="Nhập shop ID..."
            className="input text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            className="input text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            className="input text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-muted mb-1">
            Sắp xếp theo
          </label>
          <select
            name="sortBy"
            defaultValue={sortBy}
            className="input text-sm w-full cursor-pointer"
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="grossAmount">Doanh thu gộp</option>
            <option value="commissionFee">Phí hoa hồng</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            name="sortOrder"
            defaultValue={sortOrder}
            className="input text-sm w-1/2 cursor-pointer"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>

          <button
            type="submit"
            className="btn-primary btn-md w-1/2 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Lọc</span>
          </button>
        </div>
      </form>

      {/* Financial Ledger Table */}
      <section className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Sổ cái chi tiết doanh thu đơn hàng</h3>
          <span className="text-xs text-ink-muted">
            Hiển thị {items.length} trên tổng số {ledgerRes.totalItems} giao dịch
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">Order ID</th>
                <th className="py-3 px-4 text-left font-semibold">Shop ID</th>
                <th className="py-3 px-4 text-right font-semibold">Doanh thu gộp</th>
                <th className="py-3 px-4 text-right font-semibold">Phí sàn (5%)</th>
                <th className="py-3 px-4 text-right font-semibold">Thuế nộp thay (1.5%)</th>
                <th className="py-3 px-4 text-right font-semibold">Thực nhận Seller</th>
                <th className="py-3 px-4 text-left font-semibold">Ngày ghi nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    Không tìm thấy dữ liệu sổ cái doanh thu.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-alt/70 transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/orders?orderId=${item.orderId}`}
                        className="font-mono text-xs text-primary hover:underline truncate max-w-[100px] cursor-pointer"
                        title={item.orderId}
                      >
                        {item.orderId.slice(0, 8)}…
                      </Link>
                      <CopyButton value={item.orderId} label="Copy Order ID" />
                    </div>
                  </td>

                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/shops?shopId=${item.shopId}`}
                        className="font-mono text-xs text-ink hover:text-primary transition-colors truncate max-w-[100px] cursor-pointer"
                        title={item.shopId}
                      >
                        {item.shopId.slice(0, 8)}…
                      </Link>
                      <CopyButton value={item.shopId} label="Copy Shop ID" />
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-medium">
                    {formatVND(item.grossAmount)}
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-emerald-600">
                    -{formatVND(item.commissionFee)}
                  </td>

                  <td className="py-3 px-4 text-right font-medium text-purple-600">
                    -{formatVND(item.taxWithheld)}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-amber-700">
                    {formatVND(item.netSellerAmount)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-xs text-ink-muted">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) =>
          buildHref({ page: n, shopId, startDate, endDate, sortBy, sortOrder })
        }
      />
    </div>
  );
}

function KpiCard({
  title,
  subtitle,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="card p-4 hover:shadow-floating transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-ink-muted">{title}</span>
        <div className={`p-2 rounded-lg ${tone}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-ink">{value}</h2>
      <p className="text-[11px] text-ink-subtle mt-1">{subtitle}</p>
    </div>
  );
}
