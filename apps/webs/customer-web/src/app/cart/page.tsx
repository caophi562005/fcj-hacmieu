import { TicketPercent, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { MainShell } from '../../components/MainShell';
import { formatVnd } from '../../components/ProductCard';
import { PRODUCTS } from '../../components/mockData';

export default function CartPage() {
  const items = PRODUCTS.slice(0, 3).map((p, i) => ({ ...p, qty: i + 1 }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = 0;
  const discount = 30000;
  const total = subtotal + shipping - discount;

  return (
    <MainShell>
      <div className="container-page py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">
          Giỏ hàng của bạn
        </h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4">
          {/* Items */}
          <div className="space-y-3">
            <div className="card">
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_40px] items-center px-4 py-3 border-b border-border-subtle text-sm text-ink-muted">
                <span>Sản phẩm</span>
                <span className="text-center">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Thành tiền</span>
                <span></span>
              </div>
              {items.map((it) => (
                <div
                  key={it.id}
                  className="grid grid-cols-[80px_1fr_40px] md:grid-cols-[1fr_120px_120px_120px_40px] items-center gap-3 p-4 border-b border-border-subtle last:border-0"
                >
                  <div className="md:contents">
                    <div className="flex items-center gap-3 md:col-span-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-20 h-20 rounded object-cover bg-surface-muted shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm line-clamp-2">{it.name}</div>
                        <div className="text-xs text-ink-subtle mt-1">
                          Phân loại: Mặc định
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:text-center text-sm">
                    <span className="md:hidden text-ink-subtle mr-1">Giá:</span>
                    <span className="text-primary font-semibold">
                      {formatVnd(it.price)}
                    </span>
                  </div>
                  <div className="md:flex md:justify-center">
                    <div className="inline-flex items-center border border-border rounded">
                      <button className="w-8 h-8 hover:bg-surface-muted">
                        −
                      </button>
                      <input
                        defaultValue={it.qty}
                        className="w-10 h-8 text-center bg-white outline-none text-sm"
                        aria-label="Số lượng"
                      />
                      <button className="w-8 h-8 hover:bg-surface-muted">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="md:text-right text-sm font-semibold text-primary">
                    {formatVnd(it.price * it.qty)}
                  </div>
                  <div className="text-right">
                    <button
                      className="w-8 h-8 inline-flex items-center justify-center rounded text-ink-muted hover:text-danger hover:bg-danger/5 transition-colors"
                      aria-label="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-4 flex items-center gap-3">
              <TicketPercent className="w-5 h-5 text-primary shrink-0" />
              <input className="input" placeholder="Nhập mã giảm giá" />
              <button className="btn-primary btn-md">Áp dụng</button>
            </div>
          </div>

          {/* Summary */}
          <aside className="space-y-3">
            <div className="card p-4 lg:sticky lg:top-20">
              <h2 className="font-semibold mb-3">Tóm tắt đơn hàng</h2>
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
                  <dt className="text-ink-muted">Giảm giá</dt>
                  <dd className="text-success">-{formatVnd(discount)}</dd>
                </div>
                <div className="border-t border-border-subtle pt-2 flex justify-between text-base">
                  <dt className="font-semibold">Tổng cộng</dt>
                  <dd className="font-bold text-primary text-lg">
                    {formatVnd(total)}
                  </dd>
                </div>
              </dl>
              <Link href="/payment" className="btn-primary btn-lg w-full mt-4">
                Tiến hành thanh toán
              </Link>
              <Link
                href="/search"
                className="btn-ghost btn-md w-full mt-2 text-primary"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </MainShell>
  );
}
