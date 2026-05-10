import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryById } from '../../../lib/admin-catalog';
import { CategoryDetailForm } from '../ui';

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);
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

      <div className="max-w-4xl">
        <CategoryDetailForm
          category={{
            id: category.id,
            name: category.name,
            logo: category.logo,
            parentCategoryId: category.parentCategoryId,
          }}
        />
      </div>
    </div>
  );
}
