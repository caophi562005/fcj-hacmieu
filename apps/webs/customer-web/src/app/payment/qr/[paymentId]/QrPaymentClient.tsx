'use client';

import type { GetPaymentResponse } from '@common/interfaces/models/payment';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatVnd } from '../../../../components/ProductCard';

type Props = {
  payment: GetPaymentResponse;
};

type PaymentSseEnvelope = {
  type?: string;
  data?: {
    userId?: string;
    paymentId?: string;
    paymentCode?: string;
    message?: string;
  };
};

export function QrPaymentClient({ payment }: Props) {
  const [status, setStatus] = useState(payment.status);
  const isPaid = status === 'SUCCESS';

  const orderDetailHref = payment.orderId?.[0]
    ? `/profile/orders/${payment.orderId[0]}`
    : '/profile/orders';

  useEffect(() => {
    if (isPaid) return;

    const es = new EventSource('/api/payment/sse');
    const onMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as PaymentSseEnvelope;
        if (payload?.data?.paymentId !== payment.id) return;
        setStatus('SUCCESS');
      } catch {
        // ignore malformed events
      }
    };

    es.addEventListener('message', onMessage as EventListener);

    return () => {
      es.removeEventListener('message', onMessage as EventListener);
      es.close();
    };
  }, [isPaid, payment.id]);

  const isTopup = payment.code?.startsWith('TOPUP');

  if (isPaid) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-5">
          <CheckCircle2 className="w-11 h-11 text-success" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold mb-2">
          {isTopup ? 'Nạp xu thành công' : 'Bạn đã thanh toán'}
        </h1>
        <p className="text-sm text-ink-muted mb-4">
          Mã thanh toán{' '}
          <span className="font-medium text-ink">{payment.code}</span> đã được
          ghi nhận.
        </p>
        <p className="text-lg font-bold text-primary mb-6">
          {formatVnd(payment.amount)}
        </p>
        {isTopup ? (
          <Link
            href="/profile/coin"
            className="btn-primary btn-lg w-full cursor-pointer"
          >
            Về ví xu
          </Link>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/" className="btn-outline btn-lg w-full cursor-pointer">
              Trang chủ
            </Link>
            <Link
              href={orderDetailHref}
              className="btn-primary btn-lg w-full cursor-pointer"
            >
              Đơn mua
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Thanh toán QR</h1>
        <p className="text-sm text-ink-muted">
          Mã thanh toán:{' '}
          <span className="font-medium text-ink">{payment.code}</span>
        </p>
        <p className="text-lg font-bold text-primary mt-2">
          {formatVnd(payment.amount)}
        </p>
        <p className="text-sm text-ink-muted mt-1">
          Trạng thái: Chờ thanh toán
        </p>
      </div>

      <div className="card p-6 text-center">
        {payment.qrCode ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payment.qrCode}
            alt="QR thanh toán"
            className="w-72 h-72 max-w-full mx-auto rounded border border-border-subtle"
          />
        ) : (
          <p className="text-sm text-ink-muted">
            Không có mã QR cho phương thức này.
          </p>
        )}
        <p className="text-xs text-ink-subtle mt-3">
          Hệ thống sẽ tự cập nhật khi giao dịch thành công.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={orderDetailHref}
          className="btn-outline btn-md w-full text-center cursor-pointer"
        >
          Đơn mua
        </Link>
        <Link
          href="/"
          className="btn-primary btn-md w-full text-center cursor-pointer"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
