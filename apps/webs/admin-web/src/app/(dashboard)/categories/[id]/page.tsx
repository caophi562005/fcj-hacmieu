import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryById, getManyCategories } from '../../../../lib/admin-catalog';
import {
  CategoryCreateForm,
  CategoryDetailForm,
  ChildCategoryDialogCard,
} from '../ui';

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, childCategories] = await Promise.all([
    getCategoryById(id),
    getManyCategories(id),
  ]);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết danh mục</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {category.id}</p>
        </div>
        <Link href="/categories" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-7xl">
        <CategoryDetailForm
          category={{
            id: category.id,
            name: category.name,
            logo: category.logo,
            parentCategoryId: category.parentCategoryId,
          }}
        />
        <CategoryCreateForm parentCategoryId={category.id} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Danh mục con</h2>
        {childCategories.length === 0 ? (
          <div className="card p-8 text-sm text-ink-muted text-center">
            Danh mục này chưa có category con.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {childCategories.map((child) => (
              <ChildCategoryDialogCard
                key={child.id}
                category={{
                  id: child.id,
                  name: child.name,
                  logo: child.logo,
                  parentCategoryId: child.parentCategory?.id ?? category.id,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
