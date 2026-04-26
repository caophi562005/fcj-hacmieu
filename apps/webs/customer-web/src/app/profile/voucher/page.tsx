import { TicketPercent, Truck, Tag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Voucher = {
  type: 'percent' | 'shipping' | 'amount';
  title: string;
  desc: string;
  expiry: string;
  used?: number;
  icon: LucideIcon;
};

const VOUCHERS: Voucher[] = [
  {
    type: 'percent',
    title: 'Giảm 15%',
    desc: 'Đơn hàng từ 200.000₫. Tối đa 50.000₫',
    expiry: 'HSD: 31/12/2024',
    used: 65,
    icon: TicketPercent,
  },
  {
    type: 'shipping',
    title: 'Freeship 30K',
    desc: 'Đơn hàng từ 150.000₫. Áp dụng toàn quốc',
    expiry: 'HSD: 28/12/2024',
    used: 30,
    icon: Truck,
  },
  {
    type: 'amount',
    title: 'Giảm 50.000₫',
    desc: 'Đơn hàng từ 500.000₫. 1 lần / khách',
    expiry: 'HSD: 25/12/2024',
    used: 80,
    icon: Tag,
  },
];

const TABS = ['Tất cả', 'Giảm giá', 'Vận chuyển', 'Đã sử dụng'];

export default function VoucherPage() {
  return (
    <>
      <div className="card p-5 mb-4">
        <h1 className="text-lg font-semibold">Kho voucher</h1>
        <p className="text-sm text-ink-muted mt-1">
          Sử dụng voucher để được giảm giá khi mua sắm.
        </p>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`btn-sm rounded-full whitespace-nowrap ${
                i === 0 ? 'bg-primary text-white' : 'btn-outline'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {VOUCHERS.map((v, i) => {
          const Icon = v.icon;
          return (
            <div
              key={i}
              className="relative flex bg-white rounded-md shadow-card overflow-hidden border border-transparent hover:border-primary/30 transition-colors"
            >
              <div className="w-24 shrink-0 bg-gradient-to-br from-primary to-primary-600 text-white flex flex-col items-center justify-center p-3">
                <Icon className="w-7 h-7" />
                <div className="text-xs mt-1 font-medium uppercase tracking-wider">
                  V-Shop
                </div>
              </div>
              <div className="absolute left-[96px] top-0 bottom-0 border-l border-dashed border-border" />
              <div className="flex-1 p-4">
                <h3 className="font-bold text-base">{v.title}</h3>
                <p className="text-xs text-ink-muted line-clamp-2 mt-0.5">
                  {v.desc}
                </p>
                <div className="text-[10px] text-ink-subtle mt-1">{v.expiry}</div>
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${v.used ?? 0}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-subtle mt-1">
                    Đã dùng {v.used ?? 0}%
                  </div>
                </div>
                <button className="btn-primary btn-sm mt-3 w-full">
                  Dùng ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
