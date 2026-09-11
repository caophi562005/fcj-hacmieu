'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { cancelOrderAction } from './actions';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const cancel = () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={cancel}
      className="btn btn-md cursor-pointer border border-danger bg-white text-danger transition-colors hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Đang hủy...' : 'Hủy đơn'}
    </button>
  );
}
