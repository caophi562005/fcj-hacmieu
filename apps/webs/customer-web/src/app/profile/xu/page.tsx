import { Coins, ArrowLeft, Gift, ShoppingCart, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Tx = {
  icon: LucideIcon;
  label: string;
  date: string;
  amount: number;
};

const HISTORY: Tx[] = [
  { icon: ShoppingCart, label: 'Tích từ đơn DH202401234', date: '21/04/2024', amount: 200 },
  { icon: Star, label: 'Đánh giá sản phẩm', date: '21/04/2024', amount: 50 },
  { icon: Gift, label: 'Quà sinh nhật V-Shop', date: '15/04/2024', amount: 500 },
  { icon: ArrowLeft, label: 'Sử dụng cho đơn DH202401199', date: '10/04/2024', amount: -150 },
];

export default function XuPage() {
  const balance = 2450;
  const willExpire = 320;
  return (
    <>
      <div className="card p-0 mb-4 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-700 text-white p-6">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Coins className="w-4 h-4" />
            Số dư V-Xu
          </div>
          <div className="text-4xl font-bold mt-1">
            {balance.toLocaleString('vi-VN')}
          </div>
          <div className="text-sm opacity-90 mt-2">
            ≈ {(balance * 1).toLocaleString('vi-VN')}₫ · Có{' '}
            <span className="font-semibold">{willExpire} xu</span> sắp hết hạn
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-white text-primary font-semibold rounded h-10 px-5 hover:bg-white/90 transition-colors">
              Đổi quà
            </button>
            <button className="bg-white/15 text-white border border-white/30 rounded h-10 px-5 hover:bg-white/20 transition-colors">
              Hướng dẫn
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-3">Cách kiếm V-Xu</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { t: 'Mua hàng', d: '1.000₫ = 1 xu' },
            { t: 'Đánh giá sản phẩm', d: '+50 xu / đánh giá' },
            { t: 'Mời bạn bè', d: '+200 xu / người' },
            { t: 'Nhiệm vụ hàng ngày', d: '+10 xu / ngày' },
          ].map((x) => (
            <li
              key={x.t}
              className="flex items-center gap-3 p-3 bg-surface-alt rounded"
            >
              <div className="w-9 h-9 rounded-full bg-primary-50 text-primary flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{x.t}</div>
                <div className="text-xs text-ink-muted">{x.d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-border-subtle font-semibold">
          Lịch sử giao dịch
        </div>
        <ul className="divide-y divide-border-subtle">
          {HISTORY.map((h, i) => {
            const Icon = h.icon;
            const positive = h.amount > 0;
            return (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-surface-muted text-ink-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{h.label}</div>
                  <div className="text-xs text-ink-subtle">{h.date}</div>
                </div>
                <div
                  className={`font-bold ${
                    positive ? 'text-success' : 'text-danger'
                  }`}
                >
                  {positive ? '+' : ''}
                  {h.amount.toLocaleString('vi-VN')}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
