import Link from 'next/link';
import { getShopPayouts } from '../../../lib/credit';
import { PayoutForm } from './PayoutForm';

export const metadata = { title: 'Yêu cầu rút tiền — V-Shop Seller' };

export default async function FinancePayoutsPage() {
  const payoutData = await getShopPayouts({ page: 1, limit: 20 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">Yêu cầu rút tiền</h1>
          <p className="text-ink-muted mt-1">
            Quản lý các yêu cầu rút tiền và theo dõi trạng thái xử lý.
          </p>
        </div>
        <Link href="/finance" className="btn-outline btn-md">
          Quay lại tài chính
        </Link>
      </div>

      <PayoutForm payouts={payoutData.payouts} />
    </div>
  );
}
