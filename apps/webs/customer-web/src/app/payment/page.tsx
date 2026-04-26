import { CreditCard, MapPin, Truck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../components/MainShell';
import { formatVnd } from '../../components/ProductCard';
import { PRODUCTS } from '../../components/mockData';

export default function PaymentPage() {
  const items = PRODUCTS.slice(0, 3).map((p, i) => ({ ...p, qty: i + 1 }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = 0;
  const discount = 30000;
  const total = subtotal + shipping - discount;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">Thanh toán</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          <div className="space-y-3">
            {/* Address */}
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">Nguyễn Văn A</span>
                    <span className="text-ink-subtle">·</span>
                    <span className="text-ink-muted">+84 901 234 567</span>
                    <span className="chip ml-auto">Mặc định</span>
                  </div>
                  <p className="text-sm text-ink-muted mt-1">
                    123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                  </p>
                  <button className="text-sm text-primary font-medium hover:underline mt-2">
                    Thay đổi
                  </button>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="px-4 py-3 border-b border-border-subtle font-semibold">
                Sản phẩm ({items.length})
              </div>
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 p-4 border-b border-border-subtle last:border-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm line-clamp-2">{it.name}</div>
                    <div className="text-xs text-ink-subtle">x{it.qty}</div>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {formatVnd(it.price * it.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping method */}
            <div className="card p-4">
              <div className="font-semibold mb-3">Đơn vị vận chuyển</div>
              <div className="space-y-2">
                {[
                  {
                    id: 'fast',
                    label: 'Giao nhanh 2h',
                    price: 0,
                    eta: 'Hôm nay 14:00 - 16:00',
                  },
                  {
                    id: 'std',
                    label: 'Giao tiêu chuẩn',
                    price: 25000,
                    eta: '2 - 3 ngày',
                  },
                ].map((m, i) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      i === 0
                        ? 'border-primary bg-primary-50/40'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ship"
                      defaultChecked={i === 0}
                      className="accent-primary"
                    />
                    <Truck className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-xs text-ink-subtle">
                        Dự kiến: {m.eta}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {m.price === 0 ? (
                        <span className="text-success">Miễn phí</span>
                      ) : (
                        formatVnd(m.price)
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-4">
              <div className="font-semibold mb-3">Phương thức thanh toán</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'cod',
                    label: 'Thanh toán khi nhận hàng',
                    icon: Wallet,
                  },
                  {
                    id: 'card',
                    label: 'Thẻ tín dụng / ghi nợ',
                    icon: CreditCard,
                  },
                  { id: 'momo', label: 'Ví MoMo', icon: Wallet },
                  {
                    id: 'bank',
                    label: 'Chuyển khoản ngân hàng',
                    icon: CreditCard,
                  },
                ].map((m, i) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                      i === 0
                        ? 'border-primary bg-primary-50/40'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      defaultChecked={i === 0}
                      className="accent-primary"
                    />
                    <m.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="card p-4">
              <label className="block">
                <span className="font-semibold text-sm">
                  Ghi chú cho người bán
                </span>
                <textarea
                  rows={3}
                  placeholder="Lưu ý cho người bán (không bắt buộc)…"
                  className="input mt-2 h-auto py-2"
                />
              </label>
            </div>
          </div>

          {/* Summary */}
          <aside>
            <div className="card p-4 lg:sticky lg:top-20">
              <h2 className="font-semibold mb-3">Chi tiết thanh toán</h2>
              <dl className="text-sm space-y-2">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Tạm tính</dt>
                  <dd>{formatVnd(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Phí vận chuyển</dt>
                  <dd className="text-success">Miễn phí</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Voucher giảm giá</dt>
                  <dd className="text-success">-{formatVnd(discount)}</dd>
                </div>
                <div className="border-t border-border-subtle pt-2 flex justify-between">
                  <dt className="font-semibold">Tổng thanh toán</dt>
                  <dd className="font-bold text-primary text-lg">
                    {formatVnd(total)}
                  </dd>
                </div>
              </dl>
              <button className="btn-primary btn-lg w-full mt-4">
                Đặt hàng
              </button>
              <p className="text-xs text-ink-subtle mt-2 text-center">
                Bằng việc đặt hàng, bạn đồng ý với{' '}
                <Link href="#" className="text-primary hover:underline">
                  Điều khoản V-Shop
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </MainShell>
  );
}
