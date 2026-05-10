import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAttributeById } from '../../../lib/admin-catalog';
import { AttributeDetailForm } from '../ui';

export default async function AttributeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attribute = await getAttributeById(id);
  if (!attribute) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết thuộc tính</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {attribute.id}</p>
        </div>
        <Link href="/attributes" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-4xl">
        <AttributeDetailForm
          attribute={{
            id: attribute.id,
            name: attribute.name,
            url: attribute.url ?? '',
          }}
        />
      </div>
    </div>
  );
}
