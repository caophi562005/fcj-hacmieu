import { getManyCategories } from '../../../lib/admin-catalog';
import { CategoryCreateForm, CategoryLinkCard } from './ui';

export default async function CategoriesPage() {
  const categories = await getManyCategories(undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý danh mục</h1>
        <p className="text-ink-muted text-sm mt-1">
          Danh sách category gốc, không phân trang.
        </p>
      </div>

      <CategoryCreateForm />

      <section className="space-y-3">
        {categories.length === 0 ? (
          <div className="card p-10 text-center text-ink-muted">
            Không có category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map((category) => (
              <CategoryLinkCard
                key={category.id}
                category={{
                  id: category.id,
                  name: category.name,
                  logo: category.logo,
                  parentCategoryId: category.parentCategory?.id ?? null,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
