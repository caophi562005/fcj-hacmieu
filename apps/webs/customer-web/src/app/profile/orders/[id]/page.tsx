import { OrderStatusValues } from '@common/constants/order.constant';
import {
  PaymentMethodValues,
  PaymentStatusValues,
} from '@common/constants/payment.constant';
import type { ReviewResponse } from '@common/interfaces/models/utility';
import type { LucideIcon } from 'lucide-react';
import {
  CircleCheck,
  Clock3,
  MapPin,
  Package,
  Receipt,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatVnd } from '../../../../components/ProductCard';
import { ReportButton } from '../../../../components/ReportButton';
import { getMyOrderById } from '../../../../lib/order';
import { getMyReviewByOrderItemId } from '../../../../lib/review';
import { OrderReviews } from './OrderReviews';

function statusLabel(
  status: string,
  paymentMethod?: string,
  paymentStatus?: string,
): string {
  switch (status) {
    case OrderStatusValues.CREATING:
      return 'Đang tạo';
    case OrderStatusValues.PENDING:
      if (
        paymentMethod === PaymentMethodValues.WALLET &&
        paymentStatus === PaymentStatusValues.PENDING
      ) {
        return 'Chờ thanh toán';
      }
      return 'Chờ xác nhận';
    case OrderStatusValues.CONFIRMED:
      return 'Chờ giao hàng';
    case OrderStatusValues.SHIPPING:
      return 'Đang giao';
    case OrderStatusValues.COMPLETED:
      return 'Hoàn thành';
    case OrderStatusValues.CANCELLED:
      return 'Đã hủy';
    case OrderStatusValues.REFUNDED:
      return 'Đã hoàn tiền';
    default:
      return status;
  }
}

function paymentStatusLabel(status: string): string {
  switch (status) {
    case PaymentStatusValues.PENDING:
      return 'Chờ thanh toán';
    case PaymentStatusValues.SUCCESS:
      return 'Đã thanh toán';
    case PaymentStatusValues.FAILED:
      return 'Thanh toán thất bại';
    case PaymentStatusValues.CANCELLED:
      return 'Đã hủy thanh toán';
    default:
      return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case OrderStatusValues.PENDING:
      return 'bg-warning/10 text-warning';
    case OrderStatusValues.CONFIRMED:
      return 'bg-secondary/15 text-primary';
    case OrderStatusValues.SHIPPING:
      return 'bg-accent text-accent-foreground';
    case OrderStatusValues.COMPLETED:
      return 'bg-success/10 text-success';
    case OrderStatusValues.CANCELLED:
    case OrderStatusValues.REFUNDED:
      return 'bg-danger/10 text-danger';
    default:
      return 'bg-surface-muted text-ink-muted';
  }
}

function formatDateTime(raw: unknown): string {
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case PaymentMethodValues.COD:
      return 'Thanh toán khi nhận hàng (COD)';
    case PaymentMethodValues.ONLINE:
      return 'Thanh toán online';
    case PaymentMethodValues.WALLET:
      return 'Ví điện tử';
    default:
      return method;
  }
}

function timelineIcon(status: string): LucideIcon {
  switch (status) {
    case OrderStatusValues.PENDING:
      return Receipt;
    case OrderStatusValues.SHIPPING:
      return Package;
    case OrderStatusValues.COMPLETED:
      return CircleCheck;
    default:
      return Clock3;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getMyOrderById(id);

  if (!order) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-ink-muted mb-4">
          Không tìm thấy đơn hàng này.
        </p>
        <Link
          href="/profile/orders"
          className="btn-primary btn-md cursor-pointer"
        >
          Quay lại đơn mua
        </Link>
      </div>
    );
  }

  const timeline =
    Array.isArray(order.timeline) && order.timeline.length > 0
      ? [...order.timeline].sort(
          (a, b) =>
            new Date(String(a.at)).getTime() - new Date(String(b.at)).getTime(),
        )
      : [{ status: order.status, at: order.createdAt }];

  const discountValue = Math.abs(order.discount || 0);
  const hasDiscount = discountValue > 0;
  const canReview = order.status === OrderStatusValues.COMPLETED;

  const reviewItems = canReview
    ? order.itemsSnapshot.map((it) => ({
        orderId: order.id,
        orderItemId: it.id,
        sellerId: order.shopId,
        productId: it.productId,
        productName: it.productName,
        skuValue: it.skuValue,
        productImage: it.productImage,
        quantity: it.quantity,
      }))
    : [];

  const reviewEntries = canReview
    ? await Promise.all(
        reviewItems.map(async (it) => {
          const review = await getMyReviewByOrderItemId(it.orderItemId);
          return [it.orderItemId, review] as const;
        }),
      )
    : [];

  const initialReviews = Object.fromEntries(reviewEntries) as Record<
    string,
    ReviewResponse | null
  >;

  return (
    <>
      <div className="card p-5 mb-4 flex flex-wrap items-center gap-3">
        <Link
          href="/profile/orders"
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          ← Đơn mua
        </Link>
        <div className="text-sm">
          Mã đơn: <span className="font-semibold">{order.code}</span>
        </div>
        <span
          className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded ${statusBadgeClass(
            order.status,
          )}`}
        >
          {statusLabel(order.status, order.paymentMethod, order.paymentStatus)}
        </span>
      </div>

      {/* Tracking */}
      <div className="card p-5 mb-4 overflow-x-auto">
        <h2 className="font-semibold mb-4">Trạng thái đơn hàng</h2>
        <ol className="flex items-start min-w-[420px]">
          {timeline.map((step, i) => {
            const Icon = timelineIcon(step.status);
            return (
              <li
                key={i}
                className="flex-1 flex flex-col items-center relative"
              >
                <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white">
                  <Icon className="w-5 h-5" />
                </div>
                {i < timeline.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-primary" />
                )}
                <div className="text-xs mt-2 font-medium text-center">
                  {statusLabel(
                    step.status,
                    order.paymentMethod,
                    order.paymentStatus,
                  )}
                </div>
                <div className="text-[10px] text-ink-subtle">
                  {formatDateTime(step.at)}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Địa chỉ nhận hàng</h3>
              <p className="text-sm mt-1">
                {order.receiver.name} · {order.receiver.phone}
              </p>
              <p className="text-sm text-ink-muted">{order.receiver.address}</p>
              {order.receiver.note && (
                <p className="text-xs text-ink-subtle mt-1">
                  Ghi chú: {order.receiver.note}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Thanh toán</h3>
              <p className="text-sm mt-1">
                {paymentMethodLabel(order.paymentMethod)}
              </p>
              <p className="text-sm text-ink-muted">
                Trạng thái: {paymentStatusLabel(order.paymentStatus)}
              </p>
              {order.paymentId && (
                <p className="text-xs text-ink-subtle mt-1">
                  Mã thanh toán: {order.paymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="px-4 py-3 border-b border-border-subtle font-semibold">
          Sản phẩm ({order.itemsSnapshot.length})
        </div>
        {order.itemsSnapshot.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 p-4 border-b border-border-subtle last:border-0"
          >
            <Link
              href={`/product/${it.productId}`}
              className="block cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.productImage || '/placeholder.png'}
                alt={it.productName}
                className="w-16 h-16 rounded object-cover bg-surface-muted"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${it.productId}`}
                className="text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer"
              >
                {it.productName}
              </Link>
              <div className="text-xs text-ink-subtle mt-1">
                Phân loại: {it.skuValue || 'Mặc định'}
              </div>
              <div className="text-xs text-ink-subtle">x{it.quantity}</div>
            </div>
            <div className="text-sm font-semibold text-primary">
              {formatVnd(it.price * it.quantity)}
            </div>
          </div>
        ))}
      </div>

      {canReview ? (
        <OrderReviews items={reviewItems} initialReviews={initialReviews} />
      ) : null}

      <div className="card p-5">
        <h3 className="font-semibold mb-3">Tổng kết</h3>
        <dl className="text-sm space-y-2">
          <Row label="Tạm tính" value={formatVnd(order.itemTotal)} />
          <Row
            label="Phí vận chuyển"
            value={
              order.shippingFee === 0 ? (
                <span className="text-success">Miễn phí</span>
              ) : (
                formatVnd(order.shippingFee)
              )
            }
          />
          <Row
            label="Voucher giảm giá"
            value={
              hasDiscount ? (
                <span className="text-success">
                  -{formatVnd(discountValue)}
                </span>
              ) : (
                <span className="text-ink-muted">Không áp dụng</span>
              )
            }
          />
          <Row
            label={
              <span className="font-semibold text-base">Tổng thanh toán</span>
            }
            value={
              <span className="font-bold text-primary text-lg">
                {formatVnd(order.grandTotal)}
              </span>
            }
            border
          />
          <Row
            label="Phương thức"
            value={paymentMethodLabel(order.paymentMethod)}
          />
        </dl>
        <div className="flex flex-wrap gap-2 mt-5">
          <button className="btn-outline btn-md cursor-pointer">
            Liên hệ shop
          </button>
          <ReportButton
            targetType="ORDER"
            targetId={order.id}
            variant="custom"
            className="btn-outline btn-md cursor-pointer text-ink-muted hover:text-danger hover:border-danger hover:bg-danger-50 transition-colors"
            label="Báo cáo"
          />
          <button className="btn-primary btn-md cursor-pointer ml-auto">Mua lại</button>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  border,
}: {
  label: ReactNode;
  value: ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        border ? 'border-t border-border-subtle pt-2' : ''
      }`}
    >
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
