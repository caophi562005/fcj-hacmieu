import Link from 'next/link';
import { Pagination } from '../../components/Pagination';
import { getManyPromotions } from '../../lib/admin-promotion';
import { PromotionCreateForm } from './ui';

type SearchParams = { page?: string; code?: string; name?: string; status?: string };

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; code?: string; name?: string; status?: string }) {
  const sp = new URLSearchParams();
  if (query.code) sp.set('code', query.code);
  if (query.name) sp.set('name', query.name);
  if (query.status) sp.set('status', query.status);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/promotions?${qs}` : '/promotions';
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const code = (sp.code ?? '').trim();
  const name = (sp.name ?? '').trim();
  const status = (sp.status ?? '').trim();

  const data = await getManyPromotions({
    page,
    limit: 10,
    code: code || undefined,
    name: name || undefined,
    status: status || undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý voucher</h1>
        <p className="text-ink-muted text-sm mt-1">Tổng cộng {data.totalItems} chương trình.</p>
      </div>

      <form action="/promotions" method="GET" className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input name="code" defaultValue={code} placeholder="Code" className="input" />
        <input name="name" defaultValue={name} placeholder="Tên" className="input" />
        <input name="status" defaultValue={status} placeholder="Status" className="input" />
        <button type="submit" className="btn-primary btn-md">Tìm kiếm</button>
      </form>

      <PromotionCreateForm />

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Code</th>
                <th className="py-3 px-4 text-left font-semibold">Tên</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.promotions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-ink-muted">Không có promotion.</td>
                </tr>
              )}
              {data.promotions.map((p) => (
                <tr key={p.id} className="hover:bg-surface-alt transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/promotions/${p.id}`} className="text-primary hover:underline cursor-pointer">
                      {p.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3 px-4">{p.code}</td>
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref({ page: n, code, name, status })}
      />
    </div>
  );
}
