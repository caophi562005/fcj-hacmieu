'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { cancelProductPlacementAction } from './actions';

export function CancelPlacementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  const cancel = () => {
    const reason = window
      .prompt(
        'Nhập lý do hủy vị trí. Thao tác này dừng hiển thị ngay và không hoàn phí:',
      )
      ?.trim();
    if (!reason) return;
    startTransition(async () => {
      const result = await cancelProductPlacementAction(id, reason);
      if (result.ok) toast.success('Đã hủy vị trí quảng bá.');
      else toast.error(result.message);
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={cancel}
      className="btn-outline btn-sm text-danger"
    >
      {pending ? 'Đang hủy...' : 'Hủy vị trí'}
    </button>
  );
}
