'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updatePayoutStatusAction } from './actions';

export function PayoutStatusButtons({
  shopId,
  payoutId,
}: {
  shopId: string;
  payoutId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const updateStatus = (status: 'PENDING' | 'TRANSFERRED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await updatePayoutStatusAction({ shopId, payoutId, status });
      if (res.ok) toast.success('Cập nhật payout thành công.');
      else toast.error(res.message || 'Cập nhật payout thất bại.');
    });
  };

  return (
    <div className="flex gap-2">
      <button type="button" className="btn-outline btn-sm" disabled={isPending} onClick={() => updateStatus('PENDING')}>
        PENDING
      </button>
      <button type="button" className="btn-primary btn-sm" disabled={isPending} onClick={() => updateStatus('TRANSFERRED')}>
        TRANSFERRED
      </button>
      <button type="button" className="btn-outline btn-sm" disabled={isPending} onClick={() => updateStatus('REJECTED')}>
        REJECTED
      </button>
    </div>
  );
}
