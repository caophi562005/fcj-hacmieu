import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayoutById } from '../../../lib/admin-shop-wallet';
import { PayoutStatusButtons } from '../ui';

type SearchParams = { shopId?: string };

export default async function PayoutDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const shopId = (sp.shopId ?? '').trim();

  if (!shopId) notFound();

  const payout = await getPayoutById(shopId, id);
  if (!payout) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Chi tiết payout</h1>
          <p className="text-ink-muted text-sm mt-1">ID: {payout.id}</p>
        </div>
        <Link href="/payouts" className="btn-outline btn-sm">
          Quay lại danh sách
        </Link>
      </div>

      <section className="card p-6 md:p-8 space-y-6 max-w-4xl">
        <p>
          <strong>Shop:</strong> {payout.shopId}
        </p>
        <p>
          <strong>Amount:</strong>{' '}
          {(payout.amount ?? 0).toLocaleString('vi-VN')}đ
        </p>
        <p>
          <strong>Status:</strong> {payout.status}
        </p>
        <p>
          <strong>Ghi chú:</strong> {payout.note || '—'}
        </p>
        <PayoutStatusButtons shopId={payout.shopId} payoutId={payout.id} />
      </section>
    </div>
  );
}
