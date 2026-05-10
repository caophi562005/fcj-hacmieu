import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBrandById } from '../../../lib/admin-catalog';
import { BrandDetailForm } from '../ui';

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết thương hiệu</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {brand.id}</p>
        </div>
        <Link href="/brands" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-4xl">
        <BrandDetailForm
          brand={{
            id: brand.id,
            name: brand.name,
            logo: brand.logo,
          }}
        />
      </div>
    </div>
  );
}
