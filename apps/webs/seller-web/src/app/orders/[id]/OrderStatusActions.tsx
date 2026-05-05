'use client';

import {
  OrderStatusValues,
  type OrderStatus,
} from '@common/constants/order.constant';
import { CheckCircle2, Package, Truck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateOrderStatusAction } from '../actions';

type Action = {
  status: OrderStatus;
  label: string;
  variant: 'primary' | 'outline' | 'danger';
  icon: typeof CheckCircle2;
  confirm?: string;
};

function getAvailableActions(current: OrderStatus): Action[] {
  switch (current) {
    case OrderStatusValues.PENDING:
      return [
        {
          status: OrderStatusValues.CONFIRMED,
          label: 'Xác nhận đơn',
          variant: 'primary',
          icon: CheckCircle2,
        },
        {
          status: OrderStatusValues.CANCELLED,
          label: 'Hủy đơn',
          variant: 'danger',
          icon: XCircle,
          confirm: 'Bạn có chắc muốn hủy đơn hàng này?',
        },
      ];
    case OrderStatusValues.CONFIRMED:
      return [
        {
          status: OrderStatusValues.SHIPPING,
          label: 'Bắt đầu giao',
          variant: 'primary',
          icon: Truck,
        },
        {
          status: OrderStatusValues.CANCELLED,
          label: 'Hủy đơn',
          variant: 'danger',
          icon: XCircle,
          confirm: 'Bạn có chắc muốn hủy đơn hàng này?',
        },
      ];
    case OrderStatusValues.SHIPPING:
      return [
        {
          status: OrderStatusValues.COMPLETED,
          label: 'Hoàn tất đơn',
          variant: 'primary',
          icon: Package,
        },
      ];
    default:
      return [];
  }
}

export function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const actions = getAvailableActions(currentStatus);

  if (actions.length === 0) return null;

  const handle = (a: Action) => {
    if (a.confirm && !window.confirm(a.confirm)) return;
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, a.status);
      if (res.ok) {
        toast.success(`Đã cập nhật: ${a.label}`);
        router.refresh();
      } else {
        toast.error(res.message ?? 'Cập nhật thất bại');
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        const base =
          'btn-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';
        const cls =
          a.variant === 'primary'
            ? `btn-primary ${base}`
            : a.variant === 'danger'
              ? `btn ${base} bg-white border border-danger text-danger hover:bg-danger hover:text-white transition-colors`
              : `btn-outline ${base}`;
        return (
          <button
            key={a.status}
            type="button"
            disabled={pending}
            onClick={() => handle(a)}
            className={cls}
          >
            <Icon className="w-4 h-4" />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
