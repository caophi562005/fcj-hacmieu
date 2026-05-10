import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPromotionById } from '../../../lib/admin-promotion';
import { PromotionDetailForm } from '../ui';

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionById(id);
  if (!promotion) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết voucher</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {promotion.id}</p>
        </div>
        <Link href="/promotions" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-5xl">
        <PromotionDetailForm
          promotion={{
            id: promotion.id,
            code: promotion.code,
            name: promotion.name,
            description: promotion.description ?? '',
            status: promotion.status,
            startsAt: promotion.startsAt ?? '',
            endsAt: promotion.endsAt ?? '',
            scope: promotion.scope,
            discountType: promotion.discountType,
            minOrderSubtotal: promotion.minOrderSubtotal ?? 0,
            discountValue: promotion.discountValue ?? 0,
            maxDiscount: promotion.maxDiscount ?? 0,
            totalLimit: promotion.totalLimit ?? 0,
          }}
        />
      </div>
    </div>
  );
}
