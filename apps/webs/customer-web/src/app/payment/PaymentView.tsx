'use client';

import { DiscountTypeValues } from '@common/constants/promotion.constant';
import {
  CheckCircle2,
  Coins,
  CreditCard,
  MapPin,
  Store,
  Truck,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { formatVnd } from '../../components/ProductCard';
import { createOrderAction } from '../../lib/order.actions';
import type { PaymentShopGroupView, PaymentVoucherView } from './payment.types';

type Props = {
  groups: PaymentShopGroupView[];
  voucher: PaymentVoucherView | null;
  availableCoin: number;
  initialName?: string;
  initialPhone?: string;
  initialAddress?: string;
};

type ShippingMethod = 'fast' | 'std';
type PaymentMethod = 'COD' | 'ONLINE' | 'WALLET';

const SHIPPING_OPTIONS: Array<{
  id: ShippingMethod;
  label: string;
  eta: string;
  fee: number;
}> = [
  { id: 'fast', label: 'Giao nhanh 2h', eta: 'Hôm nay 14:00 - 16:00', fee: 0 },
  { id: 'std', label: 'Giao tiêu chuẩn', eta: '2 - 3 ngày', fee: 25000 },
];

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof Wallet;
}> = [
  { id: 'COD', label: 'Thanh toán khi nhận hàng', icon: Wallet },
  { id: 'ONLINE', label: 'Thẻ tín dụng / ghi nợ', icon: CreditCard },
  { id: 'WALLET', label: 'Ví điện tử', icon: Wallet },
];

function calcDiscount(voucher: PaymentVoucherView, subtotal: number): number {
  if (subtotal < (voucher.minOrderSubtotal ?? 0)) return 0;

  if (voucher.discountType === DiscountTypeValues.PERCENT) {
    const raw = Math.floor((subtotal * voucher.discountValue) / 10000);
    return voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
  }

  return Math.min(voucher.discountValue, subtotal);
}

export function PaymentView({ groups, voucher, availableCoin, initialName, initialPhone, initialAddress }: Props) {
  const router = useRouter();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('fast');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [coinInput, setCoinInput] = useState('0');

  const [receiverName, setReceiverName] = useState(
    () => initialName || ''
  );
  const [receiverPhone, setReceiverPhone] = useState(
    () => initialPhone || ''
  );
  const [receiverAddress, setReceiverAddress] = useState(
    () => initialAddress || ''
  );
  const [receiverNote, setReceiverNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      groups
        .flatMap((g) => g.items)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
    [groups],
  );

  const shippingFee =
    SHIPPING_OPTIONS.find((option) => option.id === shippingMethod)?.fee ?? 0;
  const voucherDiscount = voucher ? calcDiscount(voucher, subtotal) : 0;
  const payableBeforeCoin = Math.max(
    0,
    subtotal + shippingFee - voucherDiscount,
  );

  const requestedCoin = Number.parseInt(coinInput || '0', 10);
  const normalizedRequestedCoin = Number.isFinite(requestedCoin)
    ? Math.max(0, requestedCoin)
    : 0;
  const appliedCoin = Math.min(
    Math.floor(availableCoin),
    Math.floor(payableBeforeCoin),
    normalizedRequestedCoin,
  );

  const total = payableBeforeCoin - appliedCoin;
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  const handleCreateOrder = async () => {
    if (groups.length === 0 || totalItems === 0) {
      toast.info('Không có sản phẩm hợp lệ để thanh toán');
      return;
    }

    if (
      !receiverName.trim() ||
      !receiverPhone.trim() ||
      !receiverAddress.trim()
    ) {
      toast.info(
        'Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ nhận hàng',
      );
      return;
    }

    setIsSubmitting(true);
    const res = await createOrderAction({
      shippingFee,
      discountCode: voucher?.code,
      coin: appliedCoin,
      paymentMethod,
      receiver: {
        name: receiverName.trim(),
        phone: receiverPhone.trim(),
        address: receiverAddress.trim(),
        note: receiverNote.trim() || undefined,
      },
      orders: groups.map((group) => ({
        shopId: group.shopId,
        cartItemIds: group.items.map((item) => item.id),
      })),
    });
    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    if (paymentMethod === 'ONLINE' || paymentMethod === 'WALLET') {
      if (!res.paymentId) {
        toast.error('Không tạo được mã thanh toán.');
        return;
      }
      router.push(`/payment/qr/${res.paymentId}`);
      return;
    }

    setSuccessOrderId(res.orderIds?.[0] ?? null);
    setIsOrderSuccess(true);
  };

  if (isOrderSuccess) {
    return (
      <div className="card p-8 md:p-12 text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-5">
          <CheckCircle2 className="w-11 h-11 text-success" aria-hidden />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-ink mb-2">
          Chúc mừng bạn đặt hàng thành công
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          Đơn hàng của bạn đã được ghi nhận. Bạn có thể tiếp tục mua sắm hoặc
          theo dõi đơn trong mục đơn mua.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/" className="btn-outline btn-lg w-full cursor-pointer">
            Trang chủ
          </Link>
          <Link
            href={
              successOrderId
                ? `/profile/orders/${successOrderId}`
                : '/profile/orders'
            }
            className="btn-primary btn-lg w-full cursor-pointer"
          >
            Đơn mua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4">
      <div className="space-y-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Địa chỉ nhận hàng</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Họ và tên</span>
              <input
                className="input mt-1"
                placeholder="Nhập họ và tên"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Số điện thoại</span>
              <input
                className="input mt-1"
                placeholder="Nhập số điện thoại"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
              />
            </label>
          </div>
          <label className="block mt-3">
            <span className="text-sm font-medium">Địa chỉ</span>
            <input
              className="input mt-1"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
            />
          </label>
          <label className="block mt-3">
            <span className="text-sm font-medium">Ghi chú (tuỳ chọn)</span>
            <textarea
              rows={3}
              className="input mt-1 h-auto py-2"
              placeholder="Lưu ý cho người giao hàng"
              value={receiverNote}
              onChange={(e) => setReceiverNote(e.target.value)}
            />
          </label>
        </div>

        {groups.map((group) => (
          <div key={group.shopId} className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-border-subtle flex items-center justify-center shrink-0">
                {group.shopLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.shopLogo}
                    alt={group.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store className="w-4 h-4 text-ink-subtle" aria-hidden />
                )}
              </div>
              <Link
                href={`/shop/${group.shopId}`}
                className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer line-clamp-1"
              >
                {group.shopName}
              </Link>
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 border-b border-border-subtle last:border-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.productImage || '/placeholder.png'}
                  alt={item.productName}
                  className="w-16 h-16 rounded object-cover bg-surface-muted"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm line-clamp-2">{item.productName}</div>
                  <div className="text-xs text-ink-subtle mt-1 line-clamp-1">
                    Phân loại: {item.skuValue || 'Mặc định'}
                  </div>
                  <div className="text-xs text-ink-subtle">
                    x{item.quantity}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">
                  {formatVnd(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="card p-4">
          <div className="font-semibold mb-3">Đơn vị vận chuyển</div>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors duration-200 ${
                  shippingMethod === method.id
                    ? 'border-primary bg-primary-50/40'
                    : 'border-border hover:border-primary'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingMethod === method.id}
                  onChange={() => setShippingMethod(method.id)}
                  className="accent-primary"
                />
                <Truck className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{method.label}</div>
                  <div className="text-xs text-ink-subtle">
                    Dự kiến: {method.eta}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {method.fee === 0 ? (
                    <span className="text-success">Miễn phí</span>
                  ) : (
                    formatVnd(method.fee)
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <div className="font-semibold">Dùng V-Xu</div>
            </div>
            <span className="text-xs text-ink-subtle">
              Khả dụng: {formatVnd(Math.floor(availableCoin))}
            </span>
          </div>

          <label className="block">
            <span className="text-sm text-ink-muted">
              Nhập số xu muốn dùng (không vượt quá số xu hiện có)
            </span>
            <input
              type="number"
              min={0}
              max={Math.min(
                Math.floor(availableCoin),
                Math.floor(payableBeforeCoin),
              )}
              step={1}
              inputMode="numeric"
              className="input mt-2"
              value={coinInput}
              onChange={(e) => setCoinInput(e.target.value)}
            />
          </label>

          <p className="text-xs text-ink-subtle mt-2">
            V-Xu áp dụng:{' '}
            {appliedCoin > 0 ? `-${formatVnd(appliedCoin)}` : '0đ'}
          </p>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-3">Phương thức thanh toán</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {PAYMENT_OPTIONS.map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors duration-200 ${
                  paymentMethod === method.id
                    ? 'border-primary bg-primary-50/40'
                    : 'border-border hover:border-primary'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="accent-primary"
                />
                <method.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{method.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <aside>
        <div className="card p-4 lg:sticky lg:top-20">
          <h2 className="font-semibold mb-3">Chi tiết thanh toán</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink-muted">
                Tạm tính ({totalItems} sản phẩm)
              </dt>
              <dd>{formatVnd(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Phí vận chuyển</dt>
              <dd>
                {shippingFee === 0 ? (
                  <span className="text-success">Miễn phí</span>
                ) : (
                  formatVnd(shippingFee)
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Voucher giảm giá</dt>
              <dd
                className={
                  voucherDiscount > 0 ? 'text-success' : 'text-ink-muted'
                }
              >
                {voucherDiscount > 0
                  ? `-${formatVnd(voucherDiscount)}`
                  : 'Không áp dụng'}
              </dd>
            </div>
            {appliedCoin > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">V-XU</dt>
                <dd className="text-success">-{formatVnd(appliedCoin)}</dd>
              </div>
            )}
            <div className="border-t border-border-subtle pt-2 flex justify-between">
              <dt className="font-semibold">Tổng thanh toán</dt>
              <dd className="font-bold text-primary text-lg">
                {formatVnd(total)}
              </dd>
            </div>
          </dl>

          {voucher?.code && (
            <p className="text-xs text-ink-subtle mt-2">
              Đang áp dụng voucher: {voucher.code}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={isSubmitting || totalItems === 0}
            className="btn-primary btn-lg w-full mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>

          <p className="text-xs text-ink-subtle mt-2 text-center">
            Bằng việc đặt hàng, bạn đồng ý với{' '}
            <Link
              href="#"
              className="text-primary hover:underline cursor-pointer"
            >
              Điều khoản V-Shop
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}
