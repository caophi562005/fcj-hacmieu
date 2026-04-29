import type { WalletTransactionSource } from '@common/constants/wallet.constant';
import { WalletTransactionSourceValues } from '@common/constants/wallet.constant';
import type { WalletTransactionResponse } from '@common/interfaces/models/wallet';
import type { LucideIcon } from 'lucide-react';
import {
  Coins,
  Gift,
  RotateCcw,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { getAuth } from '../../../lib/auth';
import { getMyTransactions, getMyWallet } from '../../../lib/wallet';

const SOURCE_ICON: Record<WalletTransactionSource, LucideIcon> = {
  [WalletTransactionSourceValues.ORDER_REWARD]: ShoppingCart,
  [WalletTransactionSourceValues.REVIEW_REWARD]: Star,
  [WalletTransactionSourceValues.PROMOTION_GIFT]: Gift,
  [WalletTransactionSourceValues.REFERRAL]: UserPlus,
  [WalletTransactionSourceValues.TOPUP]: Wallet,
  [WalletTransactionSourceValues.REFUND]: RotateCcw,
  [WalletTransactionSourceValues.ORDER_PAYMENT]: ShoppingBag,
  [WalletTransactionSourceValues.SYSTEM]: ShieldCheck,
  [WalletTransactionSourceValues.OTHER]: Settings2,
};

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return dateFormatter.format(d);
}

export default async function XuPage() {
  const user = await getAuth();
  if (!user) redirect('/login?next=/profile/coin');

  const [wallet, history] = await Promise.all([
    getMyWallet(),
    getMyTransactions({ page: 1, limit: 20 }),
  ]);

  const balance = wallet.balance ?? 0;
  const transactions = history.transactions ?? [];

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
            ≈ {balance.toLocaleString('vi-VN')}₫
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Tính năng đang phát triển"
              className="bg-white text-primary font-semibold rounded h-10 px-5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Đổi quà
            </button>
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Tính năng đang phát triển"
              className="bg-white/15 text-white border border-white/30 rounded h-10 px-5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Hướng dẫn
            </button>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-semibold mb-3">Cách kiếm V-Xu</h2>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { icon: ShoppingCart, t: 'Mua hàng', d: '1.000₫ = 1 xu' },
            { icon: Star, t: 'Đánh giá sản phẩm', d: '+50 xu / đánh giá' },
            { icon: UserPlus, t: 'Mời bạn bè', d: '+200 xu / người' },
            { icon: Gift, t: 'Nhiệm vụ hàng ngày', d: '+10 xu / ngày' },
          ].map(({ icon: Icon, t, d }) => (
            <li
              key={t}
              className="flex items-center gap-3 p-3 bg-surface-alt rounded"
            >
              <div className="w-9 h-9 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{t}</div>
                <div className="text-xs text-ink-muted">{d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-border-subtle font-semibold">
          Lịch sử giao dịch
        </div>
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-ink-muted">
            Chưa có giao dịch nào.
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function TransactionRow({ tx }: { tx: WalletTransactionResponse }) {
  const Icon = SOURCE_ICON[tx.source] ?? Coins;
  const positive = tx.type === 'CREDIT';
  const signed = positive ? tx.amount : -tx.amount;
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="w-9 h-9 rounded-full bg-surface-muted text-ink-muted flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{tx.description}</div>
        <div className="text-xs text-ink-subtle">
          {formatDate(tx.createdAt)}
        </div>
      </div>
      <div
        className={`font-bold tabular-nums ${
          positive ? 'text-success' : 'text-danger'
        }`}
      >
        {positive ? '+' : ''}
        {signed.toLocaleString('vi-VN')}
      </div>
    </li>
  );
}
