import Link from 'next/link';
import { Pagination } from '../../components/Pagination';
import { getManyMerchants } from '../../lib/admin-shop-wallet';
import { MerchantApproveButtons } from './ui';

type SearchParams = { page?: string; legalName?: string; approvalStatus?: string };

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; legalName?: string; approvalStatus?: string }) {
  const sp = new URLSearchParams();
  if (query.legalName) sp.set('legalName', query.legalName);
  if (query.approvalStatus) sp.set('approvalStatus', query.approvalStatus);
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

  const data = await getManyMerchants({
    page,
    limit: 10,
    legalName: legalName || undefined,
    approvalStatus: approvalStatus || undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý duyệt merchant</h1>
        <p className="text-ink-muted text-sm mt-1">Tổng cộng {data.totalItems} merchant.</p>
      </div>

      <form action="/merchant" method="GET" className="card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="legalName" defaultValue={legalName} placeholder="Tên pháp lý" className="input" />
        <input name="approvalStatus" defaultValue={approvalStatus} placeholder="Approval status" className="input" />
        <button type="submit" className="btn-primary btn-md">Tìm kiếm</button>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Legal name</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">Approval</th>
                <th className="py-3 px-4 text-left font-semibold">Can sell</th>
                <th className="py-3 px-4 text-left font-semibold">Duyệt nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.merchants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-muted">Không có merchant.</td>
                </tr>
              )}
              {data.merchants.map((m) => (
                <tr key={m.id} className="hover:bg-surface-alt transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/merchant/${m.id}`} className="text-primary hover:underline cursor-pointer">
                      {m.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3 px-4">{m.legalName}</td>
                  <td className="py-3 px-4">{m.type}</td>
                  <td className="py-3 px-4">{m.approvalStatus}</td>
                  <td className="py-3 px-4">{m.canSell ? 'YES' : 'NO'}</td>
                  <td className="py-3 px-4">
                    <MerchantApproveButtons id={m.id} />
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
        buildHref={(n) => buildHref({ page: n, legalName, approvalStatus })}
      />
    </div>
  );
}
