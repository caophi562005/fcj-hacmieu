import {
  OrderStatusValues,
  type OrderStatus,
} from '@common/constants/order.constant';
import { PaymentMethodValues } from '@common/constants/payment.constant';
import { CopyButton } from '@common/web-ui/index';
import type { LucideIcon } from 'lucide-react';
import {
  CircleCheck,
  Clock3,
  MapPin,
  Package,
  Receipt,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSellerOrderById } from '../../../lib/order';
import { OrderStatusActions } from './OrderStatusActions';

export const metadata = { title: 'Chi tiết đơn hàng — V-Shop Admin' };

function statusLabel(status: string): string {
  switch (status) {
    case OrderStatusValues.CREATING:
      return 'Đang tạo';
    case OrderStatusValues.PENDING:
      return 'Chờ xác nhận';
    case OrderStatusValues.CONFIRMED:
      return 'Đã xác nhận';
    case OrderStatusValues.SHIPPING:
      return 'Đang giao';
    case OrderStatusValues.COMPLETED:
      return 'Đã giao';
    case OrderStatusValues.CANCELLED:
      return 'Đã hủy';
    case OrderStatusValues.REFUNDED:
      return 'Đã hoàn tiền';
    default:
      return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case OrderStatusValues.PENDING:
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case OrderStatusValues.CONFIRMED:
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case OrderStatusValues.SHIPPING:
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case OrderStatusValues.COMPLETED:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case OrderStatusValues.CANCELLED:
      return 'bg-red-100 text-red-700 border-red-200';
    case OrderStatusValues.REFUNDED:
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
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

function paymentStatusLabel(s: string): string {
  switch (s) {
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'SUCCESS':
      return 'Đã thanh toán';
    case 'FAILED':
      return 'Thất bại';
    case 'REFUNDED':
      return 'Đã hoàn tiền';
    default:
      return s;
  }
}

function timelineIcon(status: string): LucideIcon {
  switch (status) {
    case OrderStatusValues.PENDING:
      return Receipt;
    case OrderStatusValues.CONFIRMED:
      return CircleCheck;
    case OrderStatusValues.SHIPPING:
      return Truck;
    case OrderStatusValues.COMPLETED:
      return Package;
    case OrderStatusValues.CANCELLED:
    case OrderStatusValues.REFUNDED:
      return XCircle;
    default:
      return Clock3;
  }
}

function formatDateTime(raw: unknown): string {
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('vi-VN', {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(n: number): string {
  return (n ?? 0).toLocaleString('vi-VN') + 'đ';
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getSellerOrderById(id);

  if (!order) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-ink-muted mb-4">
          Không tìm thấy đơn hàng này.
        </p>
        <Link href="/orders" className="btn-primary btn-md cursor-pointer">
          ← Quay lại danh sách
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center gap-3">
        <Link
          href="/orders"
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          ← Danh sách đơn hàng
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Mã đơn:</span>
          <span className="font-semibold text-ink">{order.code}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-ink-muted">ID:</span>
          <span
            className="font-mono text-xs text-ink-subtle truncate max-w-[120px]"
            title={order.id}
          >
            {order.id.slice(0, 8)}…
          </span>
          <CopyButton value={order.id} label="Copy ID" />
        </div>
        <span
          className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${statusBadgeClass(
            order.status,
          )}`}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Timeline */}
      <div className="card p-5 overflow-x-auto">
        <h2 className="font-semibold mb-4 text-ink">Trạng thái đơn hàng</h2>
        <ol className="flex items-start min-w-[520px]">
          {timeline.map((step, i) => {
            const Icon = timelineIcon(step.status);
            const isCancel =
              step.status === OrderStatusValues.CANCELLED ||
              step.status === OrderStatusValues.REFUNDED;
            return (
              <li
                key={i}
                className="flex-1 flex flex-col items-center relative"
              >
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    isCancel ? 'bg-danger' : 'bg-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {i < timeline.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCancel ? 'bg-danger/40' : 'bg-primary'
                    }`}
                  />
                )}
                <div className="text-xs mt-2 font-medium text-center text-ink">
                  {statusLabel(step.status)}
                </div>
                <div className="text-[10px] text-ink-subtle">
                  {formatDateTime(step.at)}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Receiver + Payment */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-ink">
                Địa chỉ nhận hàng
              </h3>
              <p className="text-sm mt-1 text-ink">
                {order.receiver.name} · {order.receiver.phone}
              </p>
              <p className="text-sm text-ink-muted break-words">
                {order.receiver.address}
              </p>
              {order.receiver.note && (
                <p className="text-xs text-ink-subtle mt-1">
                  Ghi chú: {order.receiver.note}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-ink">Thanh toán</h3>
              <p className="text-sm mt-1 text-ink">
                {paymentMethodLabel(order.paymentMethod)}
              </p>
              <p className="text-sm text-ink-muted">
                Trạng thái: {paymentStatusLabel(order.paymentStatus)}
              </p>
              {order.paymentId && (
                <p className="text-xs text-ink-subtle mt-1 truncate">
                  Mã thanh toán: {order.paymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold text-ink">
          Sản phẩm ({order.itemsSnapshot.length})
        </div>
        {order.itemsSnapshot.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.productImage || '/placeholder.png'}
              alt={it.productName}
              className="w-16 h-16 rounded object-cover bg-surface-muted border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink line-clamp-2">
                {it.productName}
              </div>
              <div className="text-xs text-ink-subtle mt-1">
                Phân loại: {it.skuValue || 'Mặc định'}
              </div>
              <div className="text-xs text-ink-subtle">x{it.quantity}</div>
            </div>
            <div className="text-sm font-semibold text-primary whitespace-nowrap">
              {formatCurrency(it.price * it.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary + Actions */}
      <div className="card p-5">
        <h3 className="font-semibold mb-3 text-ink">Tổng kết</h3>
        <dl className="text-sm space-y-2">
          <Row label="Tạm tính" value={formatCurrency(order.itemTotal)} />
          <Row
            label="Phí vận chuyển"
            value={
              order.shippingFee === 0 ? (
                <span className="text-success">Miễn phí</span>
              ) : (
                formatCurrency(order.shippingFee)
              )
            }
          />
          <Row
            label="Voucher giảm giá"
            value={
              hasDiscount ? (
                <span className="text-success">
                  −{formatCurrency(discountValue)}
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
                {formatCurrency(order.grandTotal)}
              </span>
            }
            border
          />
        </dl>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-ink mb-3">
            Cập nhật trạng thái
          </h4>
          <OrderStatusActions
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
          />
          {(
            [
              OrderStatusValues.COMPLETED,
              OrderStatusValues.CANCELLED,
              OrderStatusValues.REFUNDED,
            ] as string[]
          ).includes(order.status) && (
            <p className="text-sm text-ink-muted">
              Đơn hàng đã {statusLabel(order.status).toLowerCase()}, không thể
              cập nhật trạng thái tiếp.
            </p>
          )}
        </div>
      </div>
    </div>
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
        border ? 'border-t border-slate-100 pt-2' : ''
      }`}
    >
      <dt className="text-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
