'use client';

import { AlertCircle, CheckCircle2, Edit3, Landmark, X } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { saveBankAccountAction, verifyBankAccountNameAction } from './actions';

type BankInfo = {
  bankName: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

type BankItem = {
  id: number;
  name: string;
  code: string;
  shortName: string;
  logo: string;
};

type BanksResponse = {
  code: string;
  data: BankItem[];
};

type Props = {
  initialBank: BankInfo;
};

function maskAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, '');
  if (digits.length <= 4) return digits;
  return `•••• •••• ${digits.slice(-4)}`;
}

function BankAccountModal({
  initialBank,
  onClose,
  onSaved,
}: {
  initialBank: BankInfo;
  onClose: () => void;
  onSaved: (next: BankInfo) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialBank.bankAccountNumber ?? '',
  );
  const [selectedBankCode, setSelectedBankCode] = useState(
    initialBank.bankCode ?? '',
  );
  const [bankAccountName, setBankAccountName] = useState(
    initialBank.bankAccountName ?? '',
  );
  const [verifyMessage, setVerifyMessage] = useState<string>('');
  const [verifyError, setVerifyError] = useState<boolean>(false);
  const [isNameMatched, setIsNameMatched] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<boolean>(false);
  const [isVerifying, startVerifyTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [lastVerifiedKey, setLastVerifiedKey] = useState<string>('');

  const selectedBank = useMemo(() => {
    return banks.find((bank) => bank.code === selectedBankCode) ?? null;
  }, [banks, selectedBankCode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks', {
          cache: 'no-store',
        });
        const data = (await response.json()) as BanksResponse;

        if (!active) return;

        const nextBanks = Array.isArray(data?.data) ? data.data : [];
        setBanks(nextBanks);

        if (!selectedBankCode && initialBank.bankName) {
          const matched = nextBanks.find(
            (item) => item.name === initialBank.bankName,
          );
          if (matched) {
            setSelectedBankCode(matched.code);
          }
        }
      } catch {
        if (!active) return;
        setBanks([]);
      } finally {
        if (active) {
          setLoadingBanks(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedBankCode, initialBank.bankName]);

  useEffect(() => {
    const bankAccount = bankAccountNumber.trim();
    const bankCode = selectedBankCode.trim();

    if (!bankAccount || !bankCode) {
      setVerifyMessage('');
      setVerifyError(false);
      setIsNameMatched(null);
      setBankAccountName('');
      setLastVerifiedKey('');
      return;
    }

    const verificationKey = `${bankCode}:${bankAccount}`;
    if (verificationKey === lastVerifiedKey) return;

    let cancelled = false;

    const timer = setTimeout(() => {
      startVerifyTransition(async () => {
        const result = await verifyBankAccountNameAction({
          bankAccountNumber: bankAccount,
          bankCode,
        });

        if (cancelled) return;

        setVerifyError(!result.ok || result.isNameMatched === false);
        setVerifyMessage(result.message);
        setIsNameMatched(result.isNameMatched ?? null);
        setBankAccountName(result.bankAccountName ?? '');
        setLastVerifiedKey(verificationKey);
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    bankAccountNumber,
    selectedBankCode,
    lastVerifiedKey,
    startVerifyTransition,
  ]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-account-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-2xl rounded-md border border-gray-200 bg-white shadow-floating overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2
            id="bank-account-modal-title"
            className="text-lg font-semibold text-ink"
          >
            Cập nhật tài khoản ngân hàng
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-muted text-ink-muted flex items-center justify-center transition-colors duration-200 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="space-y-1.5 block">
            <span className="text-sm font-medium text-ink">Số tài khoản</span>
            <input
              value={bankAccountNumber}
              onChange={(event) => {
                setBankAccountNumber(event.target.value.replace(/\D/g, ''));
                setVerifyMessage('');
                setIsNameMatched(null);
              }}
              inputMode="numeric"
              className="input"
              placeholder="Ví dụ: 0123456789"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <label className="space-y-1.5 block">
              <span className="text-sm font-medium text-ink">Ngân hàng</span>
              <select
                value={selectedBankCode}
                onChange={(event) => {
                  setSelectedBankCode(event.target.value);
                  setVerifyMessage('');
                  setIsNameMatched(null);
                }}
                className="input"
                disabled={loadingBanks}
              >
                <option value="">Chọn ngân hàng</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.code}>
                    {bank.shortName} ({bank.code})
                  </option>
                ))}
              </select>
            </label>

            <div className="h-12 w-28 rounded-md border border-gray-200 bg-white/90 flex items-center justify-center px-2">
              {selectedBank?.logo ? (
                <img
                  src={selectedBank.logo}
                  alt={selectedBank.shortName}
                  className="max-h-8 w-full object-contain"
                />
              ) : (
                <Landmark className="w-5 h-5 text-ink-muted" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink">Chủ tài khoản</span>
            <div className="rounded-md border border-gray-200 bg-surface-alt px-3 py-2.5 text-sm text-ink min-h-10 flex items-center">
              {bankAccountName}
            </div>
          </div>

          {isVerifying && (
            <p
              className="text-sm text-ink-muted"
              role="status"
              aria-live="polite"
            >
              Đang kiểm tra tài khoản...
            </p>
          )}

          {verifyMessage && (
            <p
              className={`text-sm inline-flex items-center gap-1.5 ${
                verifyError ? 'text-danger' : 'text-success'
              }`}
              role="status"
              aria-live="polite"
            >
              {verifyError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {verifyMessage}
            </p>
          )}

          {saveMessage && (
            <p
              className={`text-sm ${saveError ? 'text-danger' : 'text-success'}`}
              role="status"
              aria-live="polite"
            >
              {saveMessage}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline btn-md cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn-primary btn-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                isSaving ||
                !bankAccountNumber ||
                !selectedBank ||
                !bankAccountName ||
                isNameMatched !== true
              }
              onClick={() => {
                const bank = selectedBank;
                if (!bank) return;

                startSaveTransition(async () => {
                  const result = await saveBankAccountAction({
                    bankAccountNumber,
                    bankCode: bank.code,
                    bankName: bank.name,
                    bankAccountName,
                  });

                  setSaveError(!result.ok);
                  setSaveMessage(result.message);

                  if (result.ok) {
                    onSaved({
                      bankAccountNumber,
                      bankCode: bank.code,
                      bankName: bank.name,
                      bankAccountName,
                    });
                    setTimeout(onClose, 600);
                  }
                });
              }}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function BankAccountCard({ initialBank }: Props) {
  const [bankInfo, setBankInfo] = useState<BankInfo>(initialBank);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setBankInfo(initialBank);
  }, [initialBank]);

  const hasBank =
    !!bankInfo.bankName &&
    !!bankInfo.bankCode &&
    !!bankInfo.bankAccountNumber &&
    !!bankInfo.bankAccountName;

  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-ink-muted" />
          <h3 className="text-sm font-semibold text-ink-muted">
            Tài khoản nhận tiền chính
          </h3>
        </div>

        <button
          type="button"
          className="text-primary hover:bg-primary-50 p-2 rounded-full transition-colors duration-200 cursor-pointer"
          aria-label={
            hasBank
              ? 'Chỉnh sửa tài khoản ngân hàng'
              : 'Thêm tài khoản ngân hàng'
          }
          onClick={() => setOpen(true)}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {hasBank ? (
        <div className="rounded-md p-5 text-white shadow-floating relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="flex justify-between items-start mb-6 gap-3">
            <div className="text-sm sm:text-base font-bold tracking-wide leading-snug">
              {bankInfo.bankName}
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] border border-white/20 backdrop-blur-sm whitespace-nowrap">
              Mặc định
            </span>
          </div>
          <div className="text-lg tracking-widest opacity-90 mb-1">
            {maskAccountNumber(bankInfo.bankAccountNumber ?? '')}
          </div>
          <div className="text-xs opacity-80 uppercase tracking-wider">
            {bankInfo.bankAccountName}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 bg-surface-alt p-5">
          <p className="text-sm font-medium text-ink">
            Chưa thêm tài khoản ngân hàng
          </p>
          <p className="text-sm text-ink-muted mt-1">
            Vui lòng thêm tài khoản để nhận tiền rút từ ví cửa hàng.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-outline btn-sm mt-4 cursor-pointer"
          >
            Thêm tài khoản
          </button>
        </div>
      )}

      {open && (
        <BankAccountModal
          initialBank={bankInfo}
          onClose={() => setOpen(false)}
          onSaved={setBankInfo}
        />
      )}
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M3 8.25C3 6.73122 4.23122 5.5 5.75 5.5H18.25C19.7688 5.5 21 6.73122 21 8.25V15.75C21 17.2688 19.7688 18.5 18.25 18.5H5.75C4.23122 18.5 3 17.2688 3 15.75V8.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 9.5H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16.75" cy="13.75" r="1.25" fill="currentColor" />
    </svg>
  );
}
