'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateMerchantApprovalAction } from './actions';

export function MerchantApproveButtons({
  id,
  approvalStatus,
}: {
  id: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}) {
  const [isPending, startTransition] = useTransition();

  if (approvalStatus === 'APPROVED') {
    return <span className="text-xs text-ink-muted">Đã duyệt</span>;
  }

  if (approvalStatus === 'REJECTED') {
    return <span className="text-xs text-ink-muted">Đã từ chối</span>;
  }

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
      <button
        type="button"
        onClick={onApprove}
        className="btn-primary btn-sm"
        disabled={isPending}
      >
        Duyệt
      </button>
      <button
        type="button"
        onClick={onReject}
        className="btn-outline btn-sm"
        disabled={isPending}
      >
        Từ chối
      </button>
    </div>
  );
}
