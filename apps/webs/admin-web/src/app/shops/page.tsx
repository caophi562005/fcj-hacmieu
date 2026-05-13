import { CopyButton, Pagination } from '@common/web-ui/index';
import Link from 'next/link';
import { getManyShops } from '../../lib/admin-shop-wallet';

type SearchParams = { page?: string; name?: string; status?: string };

const SHOP_STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const;

const SHOP_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ngưng',
  CLOSED: 'Đã đóng',
};

function statusBadgeClass(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'border-success/20 bg-success/10 text-success';
    case 'INACTIVE':
      return 'border-warning/20 bg-warning/10 text-warning';
    case 'CLOSED':
      return 'border-danger/20 bg-danger/10 text-danger';
    default:
      return 'border-slate-300 bg-slate-100 text-slate-700';
  }
}

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; name?: string; status?: string }) {
  const sp = new URLSearchParams();
  if (query.name) sp.set('name', query.name);
  if (query.status) sp.set('status', query.status);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/shops?${qs}` : '/shops';
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const name = (sp.name ?? '').trim();
  const status = (sp.status ?? '').trim();

  const data = await getManyShops({
    page,
    limit: 10,
    name: name || undefined,
    status: status || undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý shop</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} shop.
        </p>
      </div>

      <form
        action="/shops"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <input
          name="name"
          defaultValue={name}
          placeholder="Tên shop"
          className="input"
        />
        <select
          name="status"
          defaultValue={status}
          className="input cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {SHOP_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {SHOP_STATUS_LABEL[value]}
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
                  Merchant ID
                </th>
                <th className="py-3 px-4 text-left font-semibold">Logo</th>
                <th className="py-3 px-4 text-left font-semibold">Tên</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Phone</th>
                <th className="py-3 px-4 text-left font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.shops.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-ink-muted">
                    Không có shop.
                  </td>
                </tr>
              )}
              {data.shops.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px]"
                        title={s.id}
                      >
                        {s.id.slice(0, 8)}…
                      </span>
                      <CopyButton value={s.id} label="Copy shop ID" />
                    </div>
                  </td>
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-mono text-xs text-ink-subtle truncate max-w-[80px]"
                        title={s.merchantId}
                      >
                        {s.merchantId.slice(0, 8)}…
                      </span>
                      <CopyButton
                        value={s.merchantId}
                        label="Copy merchant ID"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {s.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logo}
                        alt={s.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-dashed border-slate-300 bg-slate-50" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/shops/${s.id}`}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(s.status)}`}
                    >
                      {SHOP_STATUS_LABEL[s.status] || s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{s.phone || '—'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString('vi-VN')}
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
        buildHref={(n) => buildHref({ page: n, name, status })}
      />
    </div>
  );
}
