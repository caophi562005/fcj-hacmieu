'use client';

import { ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { formatVnd } from '../../../../components/ProductCard';
import { createTopupAction } from '../../../../lib/topup.actions';

const PRESETS = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000];

export function TopupClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(PRESETS[0]);
  const [customInput, setCustomInput] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = isCustom
    ? Math.max(0, Number.parseInt(customInput || '0', 10))
    : (selected ?? 0);

  const handleSubmit = async () => {
    if (amount < 10_000) {
      toast.info('Số tiền nạp tối thiểu là 10.000₫');
      return;
    }
    if (amount > 10_000_000) {
      toast.info('Số tiền nạp tối đa là 10.000.000₫');
      return;
    }

    setIsSubmitting(true);
    const res = await createTopupAction(amount);
    setIsSubmitting(false);

    if (!res.ok) {
      toast.error(res.message);
      return;
    }

    router.push(`/payment/qr/${res.paymentId}`);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/profile/coin"
          className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center hover:bg-surface-alt transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
        </Link>
        <h1 className="text-xl font-semibold">Nạp V-Xu</h1>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Chọn số tiền nạp</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSelected(value);
                setIsCustom(false);
              }}
              className={`relative p-4 rounded border text-center cursor-pointer transition-colors duration-200 ${
                !isCustom && selected === value
                  ? 'border-primary bg-primary-50/40'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div className="text-base font-bold">{formatVnd(value)}</div>
              <div className="text-xs text-ink-muted mt-1">
                {value.toLocaleString('vi-VN')} xu
              </div>
              {!isCustom && selected === value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setIsCustom(true)}
            className={`w-full p-4 rounded border text-left cursor-pointer transition-colors duration-200 ${
              isCustom
                ? 'border-primary bg-primary-50/40'
                : 'border-border hover:border-primary'
            }`}
          >
            <div className="text-sm font-medium mb-2">Nhập số tiền khác</div>
            {isCustom && (
              <input
                type="number"
                min={10000}
                max={10000000}
                step={1000}
                inputMode="numeric"
                placeholder="Nhập số tiền (VNĐ)"
                className="input w-full"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            )}
          </button>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-ink-muted">Số tiền nạp</span>
            <span className="text-lg font-bold text-primary">
              {formatVnd(amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-ink-muted">Nhận được</span>
            <span className="text-lg font-bold text-success">
              {amount.toLocaleString('vi-VN')} xu
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || amount < 10_000}
            className="btn-primary btn-lg w-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang tạo...' : `Thanh toán ${formatVnd(amount)}`}
          </button>

          <p className="text-xs text-ink-subtle mt-3 text-center">
            Bạn sẽ được chuyển sang trang QR để thanh toán qua chuyển khoản ngân
            hàng. V-Xu sẽ được cộng ngay sau khi giao dịch thành công.
          </p>
        </div>
      </div>
    </div>
  );
}
