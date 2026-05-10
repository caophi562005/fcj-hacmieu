'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateMerchantApprovalAction } from './actions';

export function MerchantApproveButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const onApprove = () => {
    startTransition(async () => {
      const res = await updateMerchantApprovalAction({
        id,
        approvalStatus: 'APPROVED',
        canSell: true,
      });
      if (res.ok) toast.success('Đã duyệt merchant.');
      else toast.error(res.message || 'Duyệt merchant thất bại.');
    });
  };

  const onReject = () => {
    startTransition(async () => {
      const res = await updateMerchantApprovalAction({
        id,
        approvalStatus: 'REJECTED',
        canSell: false,
      });
      if (res.ok) toast.success('Đã từ chối merchant.');
      else toast.error(res.message || 'Từ chối merchant thất bại.');
    });
  };

  return (
    <div className="flex gap-2">
      <button type="button" onClick={onApprove} className="btn-primary btn-sm" disabled={isPending}>
        Duyệt
      </button>
      <button type="button" onClick={onReject} className="btn-outline btn-sm" disabled={isPending}>
        Từ chối
      </button>
    </div>
  );
}
