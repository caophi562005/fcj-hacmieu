import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getShopById } from '../../../lib/admin-shop-wallet';
import { ShopDetailForm } from './shop-detail-form';

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await getShopById(id);
  if (!shop) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết shop</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {shop.id}</p>
        </div>
        <Link href="/shops" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <div className="max-w-5xl">
        <ShopDetailForm
          shop={{
            id: shop.id,
            name: shop.name,
            description: shop.description,
            status: shop.status,
            logo: shop.logo,
            banner: shop.banner,
            phone: shop.phone,
            pickupAddress: shop.pickupAddress,
            returnAddress: shop.returnAddress,
          }}
        />
      </div>
    </div>
  );
}
