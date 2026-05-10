import Link from 'next/link';
import { getManyCategories } from '../../lib/admin-catalog';
import { CategoryCreateForm } from './ui';

type SearchParams = { parentCategoryId?: string };

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const parentCategoryId = (sp.parentCategoryId ?? '').trim();
  const categories = await getManyCategories(parentCategoryId || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý danh mục</h1>
        <p className="text-ink-muted text-sm mt-1">
          Danh sách category, không phân trang.
        </p>
      </div>

      <form
        action="/categories"
        method="GET"
        className="card p-4 flex gap-3 items-center"
      >
        <input
          name="parentCategoryId"
          defaultValue={parentCategoryId}
          placeholder="Lọc theo parentCategoryId"
          className="input max-w-md"
        />
        <button type="submit" className="btn-primary btn-md">
          Lọc
        </button>
      </form>

      <CategoryCreateForm parentCategoryId={parentCategoryId} />

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-4 text-left font-semibold">ID</th>
                <th className="py-3 px-4 text-left font-semibold">Tên</th>
                <th className="py-3 px-4 text-left font-semibold">Parent</th>
                <th className="py-3 px-4 text-left font-semibold">Logo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-ink-muted">
                    Không có category.
                  </td>
                </tr>
              )}
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-alt transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/categories/${c.id}`}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {c.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4">{c.parentCategory?.id || '—'}</td>
                  <td className="py-3 px-4">{c.logo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
