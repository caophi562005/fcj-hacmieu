import Link from 'next/link';
import { MainShell } from '../../../../components/MainShell';
import { getMyPaymentById } from '../../../../lib/payment';
import { QrPaymentClient } from './QrPaymentClient';

export const dynamic = 'force-dynamic';

export default async function PaymentQrPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;

  try {
    const payment = await getMyPaymentById(paymentId);
    return (
      <MainShell>
        <QrPaymentClient payment={payment} />
      </MainShell>
    );
  } catch {
    return (
      <MainShell>
        <div className="card p-8 text-center max-w-lg mx-auto">
          <h1 className="text-lg font-semibold mb-2">Không tìm thấy thanh toán</h1>
          <p className="text-sm text-ink-muted mb-5">
            Mã thanh toán không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <Link href="/profile/orders" className="btn-primary btn-md cursor-pointer">
            Quay lại đơn mua
          </Link>
        </div>
      </MainShell>
    );
  }
}
