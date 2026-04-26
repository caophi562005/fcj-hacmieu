import Link from 'next/link';
import {
  Package,
  Truck,
  CircleCheck,
  MapPin,
  Receipt,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatVnd } from '../../../../components/ProductCard';
import { PRODUCTS } from '../../../../components/mockData';

const STEPS: { icon: LucideIcon; label: string; time: string }[] = [
  { icon: Receipt, label: 'Đơn hàng đã đặt', time: '20/04 — 09:15' },
  { icon: Package, label: 'Đã chuẩn bị xong', time: '20/04 — 14:30' },
  { icon: Truck, label: 'Đang giao hàng', time: '21/04 — 08:00' },
  { icon: CircleCheck, label: 'Giao hàng thành công', time: '21/04 — 16:42' },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const items = PRODUCTS.slice(0, 3).map((p, i) => ({ ...p, qty: i + 1 }));
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = 0;
  const discount = 30000;
  const total = subtotal + shipping - discount;
  const currentStep = 3;

  return (
    <>
      <div className="card p-5 mb-4 flex flex-wrap items-center gap-3">
        <Link href="/profile/orders" className="text-sm text-primary hover:underline">
          ← Đơn mua
        </Link>
        <div className="text-sm">
          Mã đơn:{' '}
          <span className="font-semibold">{id}</span>
        </div>
        <span className="ml-auto chip-primary">Hoàn thành</span>
      </div>

      {/* Tracking */}
      <div className="card p-5 mb-4 overflow-x-auto">
        <h2 className="font-semibold mb-4">Trạng thái đơn hàng</h2>
        <ol className="flex items-start min-w-[600px]">
          {STEPS.map((s, i) => {
            const done = i <= currentStep;
            const Icon = s.icon;
            return (
              <li key={i} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    done
                      ? 'bg-primary text-white'
                      : 'bg-surface-muted text-ink-subtle'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      i < currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
                <div className="text-xs mt-2 font-medium text-center">{s.label}</div>
                <div className="text-[10px] text-ink-subtle">{s.time}</div>
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
              <p className="text-sm mt-1">Nguyễn Văn A · +84 901 234 567</p>
              <p className="text-sm text-ink-muted">
                123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Đơn vị vận chuyển</h3>
              <p className="text-sm mt-1">V-Express · Giao nhanh 2h</p>
              <p className="text-sm text-ink-muted">Mã vận đơn: VSX1234567890</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="px-4 py-3 border-b border-border-subtle font-semibold">
          Sản phẩm ({items.length})
        </div>
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-3 p-4 border-b border-border-subtle last:border-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt={it.name} className="w-16 h-16 rounded object-cover" />
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

      <div className="card p-5">
        <h3 className="font-semibold mb-3">Tổng kết</h3>
        <dl className="text-sm space-y-2">
          <Row label="Tạm tính" value={formatVnd(subtotal)} />
          <Row label="Phí vận chuyển" value={<span className="text-success">Miễn phí</span>} />
          <Row label="Voucher giảm giá" value={<span className="text-success">-{formatVnd(discount)}</span>} />
          <Row
            label={<span className="font-semibold text-base">Tổng thanh toán</span>}
            value={
              <span className="font-bold text-primary text-lg">
                {formatVnd(total)}
              </span>
            }
            border
          />
          <Row label="Phương thức" value="Thanh toán khi nhận hàng (COD)" />
        </dl>
        <div className="flex flex-wrap gap-2 mt-5">
          <button className="btn-outline btn-md">Liên hệ shop</button>
          <button className="btn-primary btn-md">Mua lại</button>
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
  label: React.ReactNode;
  value: React.ReactNode;
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
