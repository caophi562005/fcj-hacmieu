import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMerchantById } from '../../../lib/admin-shop-wallet';
import { MerchantApproveButtons } from '../ui';

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = await getMerchantById(id);
  if (!merchant) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết merchant</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {merchant.id}</p>
        </div>
        <Link href="/merchant" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <section className="card p-6 md:p-8 space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p>
            <strong>Legal name:</strong> {merchant.legalName}
          </p>
          <p>
            <strong>Type:</strong> {merchant.type}
          </p>
          <p>
            <strong>Approval status:</strong> {merchant.approvalStatus}
          </p>
          <p>
            <strong>Can sell:</strong> {merchant.canSell ? 'YES' : 'NO'}
          </p>
        </div>
        <MerchantApproveButtons id={merchant.id} />
      </section>
    </div>
  );
}
