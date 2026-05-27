'use client';

import { PayoutStatusValues } from '@common/constants/payout.constant';
import { useActionState, useEffect, useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  cancelPayoutAction,
  createPayoutAction,
  type PayoutMutationResult,
} from './actions';

type PayoutItem = {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: string;
  createdAt: string;
  note?: string | null;
};

type BankInfo = {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type Props = {
  payouts: PayoutItem[];
  bankInfo: BankInfo;
};

const initialState: PayoutMutationResult = {
  ok: false,
  message: '',
};

function maskAccount(value: string) {
  if (value.length <= 4) return value;
  return `••••${value.slice(-4)}`;
}

export function PayoutForm({ payouts, bankInfo }: Props) {
  const hasBankInfo =
    !!bankInfo.bankName &&
    !!bankInfo.bankAccountNumber &&
    !!bankInfo.bankAccountName;
  const [state, formAction, isPending] = useActionState(
    createPayoutAction,
    initialState,
  );
  const [isCancelling, startCancelTransition] = useTransition();

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      return;
    }
    toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Tạo yêu cầu rút tiền</h2>
        <p className="text-sm text-ink-muted mt-1">
          Hệ thống sẽ giữ số dư ngay khi tạo yêu cầu. Yêu cầu bị từ chối sẽ được
          hoàn lại.
        </p>

        {!hasBankInfo && (
          <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Bạn chưa thiết lập tài khoản ngân hàng.{' '}
            <a
              href="/finance"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Thiết lập tại trang Tài chính
            </a>{' '}
            trước khi yêu cầu rút tiền.
          </div>
        )}

        <form
          action={formAction}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5"
        >
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink">Số tiền (VND)</span>
            <input
              name="amount"
              type="number"
              min={1}
              required
              className="input"
              placeholder="Ví dụ: 500000"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink">Ngân hàng</span>
            <input
              name="bankName"
              type="text"
              required
              readOnly
              value={bankInfo.bankName ?? ''}
              className="input bg-surface-alt text-ink-muted cursor-not-allowed"
              placeholder="Chưa thiết lập"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink">Số tài khoản</span>
            <input
              name="accountNumber"
              type="text"
              required
              readOnly
              value={bankInfo.bankAccountNumber ?? ''}
              className="input bg-surface-alt text-ink-muted cursor-not-allowed"
              placeholder="Chưa thiết lập"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-ink">Chủ tài khoản</span>
            <input
              name="accountHolder"
              type="text"
              required
              readOnly
              value={bankInfo.bankAccountName ?? ''}
              className="input bg-surface-alt text-ink-muted cursor-not-allowed"
              placeholder="Chưa thiết lập"
            />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-ink">Ghi chú</span>
            <textarea
              name="note"
              rows={3}
              className="input py-2 min-h-24"
              placeholder="Nội dung thêm cho yêu cầu rút tiền (tuỳ chọn)"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending || !hasBankInfo}
              className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu rút tiền'}
            </button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-ink">
            Danh sách yêu cầu gần đây
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-slate-100 text-ink-muted">
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Mã YC
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Số tiền
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Tài khoản
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="py-3 px-5 font-semibold whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-ink">
              {payouts.map((payout) => {
                const canCancel = payout.status === PayoutStatusValues.PENDING;

                return (
                  <tr
                    key={payout.id}
                    className="hover:bg-surface-alt transition-colors"
                  >
                    <td className="py-3 px-5 whitespace-nowrap">
                      #{payout.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      {payout.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      {payout.bankName} · {maskAccount(payout.accountNumber)}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      {canCancel ? (
                        <button
                          type="button"
                          className="text-danger hover:text-danger/80 transition-colors cursor-pointer"
                          disabled={isCancelling}
                          onClick={() => {
                            startCancelTransition(async () => {
                              const result = await cancelPayoutAction(
                                payout.id,
                              );
                              if (result.ok) {
                                toast.success(result.message);
                              } else {
                                toast.error(result.message);
                              }
                            });
                          }}
                        >
                          Huỷ yêu cầu
                        </button>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {payouts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 px-5 text-center text-ink-muted"
                  >
                    Chưa có yêu cầu rút tiền.
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
