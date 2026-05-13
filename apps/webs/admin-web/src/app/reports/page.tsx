import { CopyButton, Pagination } from '@common/web-ui/index';
import Link from 'next/link';
import { getManyReports } from '../../lib/admin-utility';

type SearchParams = {
  page?: string;
  status?: string;
};

const REPORT_STATUS_OPTIONS = [
  'PENDING',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
] as const;

const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  REVIEWING: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Đã từ chối',
};

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; status?: string }) {
  const sp = new URLSearchParams();
  if (query.status) sp.set('status', query.status);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/reports?${qs}` : '/reports';
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'RESOLVED':
      return 'border-success/20 bg-success/10 text-success';
    case 'REJECTED':
      return 'border-danger/20 bg-danger/10 text-danger';
    case 'REVIEWING':
      return 'border-primary/20 bg-primary/10 text-primary';
    default:
      return 'border-warning/20 bg-warning/10 text-warning';
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const status = (sp.status ?? '').trim();

  const data = await getManyReports({
    page,
    limit: 10,
    status: status
      ? (status as 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED')
      : undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Báo cáo vi phạm</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} báo cáo.
        </p>
      </div>

      <form
        action="/reports"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <select
          name="status"
          defaultValue={status}
          className="input cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {REPORT_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {REPORT_STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <div />
        <button type="submit" className="btn-primary btn-md">
          Tìm kiếm
        </button>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Reporter ID
                </th>
                <th className="py-3 px-4 text-left font-semibold">Tiêu đề</th>
                <th className="py-3 px-4 text-left font-semibold">Danh mục</th>
                <th className="py-3 px-4 text-left font-semibold">
                  Trạng thái
                </th>
                <th className="py-3 px-4 text-left font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-muted">
                    Không có báo cáo.
                  </td>
                </tr>
              )}
              {data.reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-primary font-medium">
                        {report.id.slice(0, 8)}…
                      </span>
                      <CopyButton value={report.id} label="Copy report ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-primary font-medium">
                        {report.reporterId.slice(0, 8)}…
                      </span>
                      <CopyButton
                        value={report.reporterId}
                        label="Copy reporter ID"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/reports/${report.id}`}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {report.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{report.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(report.status)}`}
                    >
                      {REPORT_STATUS_LABEL[report.status] || report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString('vi-VN')}
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
        buildHref={(n) => buildHref({ page: n, status })}
      />
    </div>
  );
}
