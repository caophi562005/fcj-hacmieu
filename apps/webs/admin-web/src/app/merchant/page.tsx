import { CopyButton, Pagination } from '@common/web-ui/index';
import { getManyMerchants } from '../../lib/admin-shop-wallet';
import { MerchantApproveButtons } from './ui';

type SearchParams = {
  page?: string;
  legalName?: string;
  approvalStatus?: string;
  type?: string;
};

const APPROVAL_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  SUSPENDED: 'Tạm khoá',
};

const TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: 'Cá nhân',
  BUSINESS: 'Doanh nghiệp',
};

const APPROVAL_OPTIONS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
] as const;
const TYPE_OPTIONS = ['INDIVIDUAL', 'BUSINESS'] as const;

function approvalBadgeClass(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'border-success/20 bg-success/10 text-success';
    case 'REJECTED':
      return 'border-danger/20 bg-danger/10 text-danger';
    case 'SUSPENDED':
      return 'border-warning/20 bg-warning/10 text-warning';
    default:
      return 'border-primary/20 bg-primary/10 text-primary';
  }
}

function typeBadgeClass(type: string) {
  return type === 'BUSINESS'
    ? 'border-info/20 bg-info/10 text-info'
    : 'border-slate-300 bg-slate-100 text-slate-700';
}

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: {
  page?: number;
  legalName?: string;
  approvalStatus?: string;
  type?: string;
}) {
  const sp = new URLSearchParams();
  if (query.legalName) sp.set('legalName', query.legalName);
  if (query.approvalStatus) sp.set('approvalStatus', query.approvalStatus);
  if (query.type) sp.set('type', query.type);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/merchant?${qs}` : '/merchant';
}

export default async function MerchantPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const legalName = (sp.legalName ?? '').trim();
  const approvalStatus = (sp.approvalStatus ?? '').trim();
  const type = (sp.type ?? '').trim();

  const data = await getManyMerchants({
    page,
    limit: 10,
    legalName: legalName || undefined,
    approvalStatus: approvalStatus || undefined,
    type: type ? (type as 'INDIVIDUAL' | 'BUSINESS') : undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Hồ sơ đăng ký merchant</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} hồ sơ.
        </p>
      </div>

      <form
        action="/merchant"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <input
          name="legalName"
          defaultValue={legalName}
          placeholder="Tên pháp lý"
          className="input"
        />
        <select
          name="approvalStatus"
          defaultValue={approvalStatus}
          className="input cursor-pointer"
        >
          <option value="">Tất cả trạng thái duyệt</option>
          {APPROVAL_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {APPROVAL_LABEL[value]}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type}
          className="input cursor-pointer"
        >
          <option value="">Tất cả loại merchant</option>
          {TYPE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {TYPE_LABEL[value]}
            </option>
          ))}
        </select>
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
                  Tên pháp lý
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Mã số thuế
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Loại merchant
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Trạng thái duyệt
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Duyệt nhanh
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.merchants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-muted">
                    Không có merchant.
                  </td>
                </tr>
              )}
              {data.merchants.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px]"
                        title={m.id}
                      >
                        {m.id.slice(0, 8)}…
                      </span>
                      <CopyButton value={m.id} label="Copy merchant ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4">{m.legalName}</td>
                  <td className="py-3 px-4">{m.taxCode || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${typeBadgeClass(m.type)}`}
                    >
                      {TYPE_LABEL[m.type] || m.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${approvalBadgeClass(m.approvalStatus)}`}
                    >
                      {APPROVAL_LABEL[m.approvalStatus] || m.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <MerchantApproveButtons
                      id={m.id}
                      approvalStatus={m.approvalStatus}
                    />
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
        buildHref={(n) =>
          buildHref({ page: n, legalName, approvalStatus, type })
        }
      />
    </div>
  );
}
