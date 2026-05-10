import Link from 'next/link';
import { Pagination } from '../../components/Pagination';
import { getManyBrands } from '../../lib/admin-catalog';
import { BrandCreateForm } from './ui';

type SearchParams = { page?: string; name?: string };

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: { page?: number; name?: string }) {
  const sp = new URLSearchParams();
  if (query.name) sp.set('name', query.name);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/brands?${qs}` : '/brands';
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const name = (sp.name ?? '').trim();

  const data = await getManyBrands({ page, limit: 10, name: name || undefined });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý thương hiệu</h1>
        <p className="text-ink-muted text-sm mt-1">Tổng cộng {data.totalItems} thương hiệu.</p>
      </div>

      <form action="/brands" method="GET" className="card p-4 flex gap-3 items-center">
        <input name="name" defaultValue={name} placeholder="Tìm theo tên brand" className="input max-w-md" />
        <button type="submit" className="btn-primary btn-md">Tìm kiếm</button>
      </form>

      <BrandCreateForm />

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Tên</th>
                <th className="py-3 px-4 text-left font-semibold">Logo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {data.brands.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-ink-muted">Không có brand.</td>
                </tr>
              )}
              {data.brands.map((b) => (
                <tr key={b.id} className="hover:bg-surface-alt transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/brands/${b.id}`} className="text-primary hover:underline cursor-pointer">
                      {b.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3 px-4">{b.name}</td>
                  <td className="py-3 px-4">{b.logo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pagination page={page} totalPages={totalPages} buildHref={(n) => buildHref({ page: n, name })} />
    </div>
  );
}
