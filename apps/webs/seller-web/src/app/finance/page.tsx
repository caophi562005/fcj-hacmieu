import {
  CreditTransactionSourceValues,
  CreditTransactionTypeValues,
} from '@common/constants/credit.constant';
import type { CreditTransactionResponse } from '@common/interfaces/models/wallet';
import { formatCurrency, formatDateTime } from '@common/web-core/lib/format';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  List,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import {
  getShopCredit,
  getShopCreditTransactions,
  getShopRevenueSummary,
} from '../../lib/credit';
import { getMerchant, getShop } from '../../lib/shop';
import { BankAccountCard } from './BankAccountCard';

export const metadata = { title: 'Tài chính — V-Shop Seller' };

type SearchParams = { days?: string };
const REVENUE_DAY_FILTERS = [7, 14, 30] as const;

function parseRevenueDays(raw?: string): (typeof REVENUE_DAY_FILTERS)[number] {
  const days = Number(raw);
  if (days === 14 || days === 30) return days;
  return 7;
}

function buildFinanceHref(days: (typeof REVENUE_DAY_FILTERS)[number]): string {
  const sp = new URLSearchParams();
  if (days !== 7) {
    sp.set('days', String(days));
  }
  const qs = sp.toString();
  return qs ? `/finance?${qs}` : '/finance';
}

type TransactionType = 'withdraw' | 'revenue' | 'refund';
type TransactionStatus = 'processing' | 'completed' | 'failed';

type Transaction = {
  id: string;
  code: string;
  createdAt: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
};

function mapTransactionType(source: string): TransactionType {
  if (source === CreditTransactionSourceValues.WITHDRAWAL) return 'withdraw';
  if (source === CreditTransactionSourceValues.REFUND) return 'refund';
  return 'revenue';
}

function mapCreditTransaction(tx: CreditTransactionResponse): Transaction {
  const sourcePrefix: Record<string, string> = {
    [CreditTransactionSourceValues.WITHDRAWAL]: 'WD',
    [CreditTransactionSourceValues.ORDER_REVENUE]: 'OR',
    [CreditTransactionSourceValues.REFUND]: 'RF',
    [CreditTransactionSourceValues.SYSTEM]: 'SY',
    [CreditTransactionSourceValues.OTHER]: 'OT',
  };

  const prefix = sourcePrefix[tx.source] ?? 'TX';
  const codeSource = tx.referenceId || tx.id;
  const code = `${prefix}-${codeSource.replace(/-/g, '').slice(-6).toUpperCase()}`;

  return {
    id: tx.id,
    code,
    createdAt: tx.createdAt,
    type: mapTransactionType(tx.source),
    description: tx.description,
    amount:
      tx.type === CreditTransactionTypeValues.CREDIT ? tx.amount : -tx.amount,
    status: 'completed',
  };
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedDays = parseRevenueDays(sp.days);

  const [credit, creditTransactions, revenue, shop, merchant] =
    await Promise.all([
      getShopCredit(),
      getShopCreditTransactions({ page: 1, limit: 10 }),
      getShopRevenueSummary(selectedDays),
      getShop(),
      getMerchant(),
    ]);
  const transactions =
    creditTransactions.transactions.map(mapCreditTransaction);
  const revenuePoints = revenue.points.map((p) => ({
    day: p.date.slice(5),
    value: p.amount,
  }));
  const maxRev = Math.max(1, ...revenuePoints.map((d) => d.value));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý Tài chính</h1>
        <p className="text-ink-muted mt-1">
          Theo dõi số dư, doanh thu và quản lý các giao dịch của cửa hàng.
        </p>
      </div>

      {/* Top grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-ink-muted">
                Tổng dư khả dụng
              </h3>
            </div>
            <div className="text-3xl font-bold text-ink mb-2">
              {formatCurrency(credit?.balance ?? 0)}
            </div>
            <p className="text-sm text-ink-muted">
              Số tiền có thể rút ngay lập tức.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/finance/payouts" className="btn-primary btn-md">
              Yêu cầu rút tiền
            </Link>
          </div>
        </div>

        <BankAccountCard
          initialBank={{
            bankName: shop?.bankName ?? null,
            bankCode: shop?.bankCode ?? null,
            bankAccountNumber: shop?.bankAccountNumber ?? null,
            bankAccountName:
              shop?.bankAccountName ?? merchant?.legalName ?? null,
          }}
        />
      </div>

      {/* Chart */}
      <section className="card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-ink">
              Doanh thu thực nhận ({selectedDays} ngày)
            </h3>
          </div>
          <div className="inline-flex items-center rounded-md border border-slate-200 bg-white p-1">
            {REVENUE_DAY_FILTERS.map((days) => {
              const isActive = selectedDays === days;

              return (
                <Link
                  key={days}
                  href={buildFinanceHref(days)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-ink-muted hover:bg-surface-alt'
                  }`}
                >
                  {days} ngày
                </Link>
              );
            })}
          </div>
        </div>
        <div className="h-64 w-full flex items-end justify-between gap-2 px-2 pt-4 border-b border-l border-slate-200 relative">
          {revenuePoints.map((d) => (
            <div
              key={d.day}
              className="relative flex-1 flex flex-col items-center group"
            >
              <div
                className="w-full max-w-[48px] bg-primary/40 group-hover:bg-primary rounded-t-sm transition-all"
                style={{ height: `${(d.value / maxRev) * 200}px` }}
                title={`${d.day}: ${d.value}`}
              />
              <span className="text-xs text-ink-muted mt-2">{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions */}
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-ink">
              Lịch sử giao dịch
            </h3>
          </div>
          <button className="text-sm text-primary font-semibold hover:bg-primary-50 px-3 py-1.5 rounded transition-colors cursor-pointer">
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-6 font-semibold whitespace-nowrap">
                  Mã GD
                </th>
                <th className="py-3 px-6 font-semibold whitespace-nowrap">
                  Thời gian
                </th>
                <th className="py-3 px-6 font-semibold whitespace-nowrap">
                  Loại giao dịch
                </th>
                <th className="py-3 px-6 font-semibold text-right whitespace-nowrap">
                  Số tiền
                </th>
                <th className="py-3 px-6 font-semibold text-center whitespace-nowrap">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-ink">
              {transactions.map((t) => (
                <TransactionRow key={t.id} tx={t} />
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 px-6 text-center text-ink-muted"
                  >
                    Chưa có giao dịch số dư.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isPositive = tx.amount >= 0;
  return (
    <tr className="hover:bg-surface-alt transition-colors">
      <td className="py-4 px-6 font-medium text-blue-700">#{tx.code}</td>
      <td className="py-4 px-6 text-ink-muted">
        {formatDateTime(tx.createdAt)}
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <TxIcon type={tx.type} />
          <span>{tx.description}</span>
        </div>
      </td>
      <td
        className={`py-4 px-6 text-right font-semibold ${
          isPositive ? 'text-success' : 'text-danger'
        }`}
      >
        {isPositive ? '+ ' : '- '}
        {Math.abs(tx.amount).toLocaleString('vi-VN')} đ
      </td>
      <td className="py-4 px-6 text-center">
        <TxStatus status={tx.status} />
      </td>
    </tr>
  );
}

function TxIcon({ type }: { type: TransactionType }) {
  if (type === 'withdraw') {
    return (
      <div className="w-8 h-8 rounded-full bg-red-50 text-danger flex items-center justify-center">
        <ArrowUp className="w-4 h-4" />
      </div>
    );
  }
  if (type === 'revenue') {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-50 text-success flex items-center justify-center">
        <ArrowDown className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-red-50 text-danger flex items-center justify-center">
      <RotateCcw className="w-4 h-4" />
    </div>
  );
}

function TxStatus({ status }: { status: TransactionStatus }) {
  const map: Record<TransactionStatus, { cls: string; label: string }> = {
    processing: {
      cls: 'bg-orange-50 text-orange-700 border-orange-200',
      label: 'Đang xử lý',
    },
    completed: {
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Hoàn thành',
    },
    failed: {
      cls: 'bg-red-50 text-red-700 border-red-200',
      label: 'Thất bại',
    },
  };
  const { cls, label } = map[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}
