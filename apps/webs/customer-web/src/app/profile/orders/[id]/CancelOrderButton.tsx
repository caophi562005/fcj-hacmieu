'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { cancelOrderAction } from './actions';
import {
  CUSTOMER_CANCEL_REASONS,
  type CustomerCancelReasonCode,
} from './cancel-reasons';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reasonCode, setReasonCode] =
    useState<CustomerCancelReasonCode | null>(null);
  const [reasonNote, setReasonNote] = useState('');
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, pending]);

  const closeDialog = () => {
    if (pending) return;
    setOpen(false);
    setReasonCode(null);
    setReasonNote('');
  };

  const submitCancellation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reasonCode) {
      toast.warn('Vui lòng chọn lý do hủy đơn');
      return;
    }

    const normalizedNote = reasonNote.trim();
    if (reasonCode === 'OTHER' && !normalizedNote) {
      toast.warn('Vui lòng nhập lý do hủy đơn');
      return;
    }

    startTransition(async () => {
      const result = await cancelOrderAction(
        orderId,
        reasonCode,
        reasonCode === 'OTHER' ? normalizedNote : undefined,
      );
      if (result.ok) {
        toast.success('Đã tiếp nhận yêu cầu hủy đơn');
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        className="btn-outline btn-md cursor-pointer text-danger"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Hủy đơn
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeDialog();
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex max-h-[min(90dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                  <div>
                    <h2 id={titleId} className="text-lg font-semibold text-ink">
                      Chọn lý do hủy đơn
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      Đơn đã hủy không thể khôi phục.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={pending}
                    aria-label="Đóng"
                    className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  id="cancel-order-form"
                  onSubmit={submitCancellation}
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
                >
                  <fieldset disabled={pending} className="space-y-2">
                    <legend className="mb-2 text-sm font-medium text-ink">
                      Lý do hủy đơn <span className="text-danger">*</span>
                    </legend>
                    {CUSTOMER_CANCEL_REASONS.map((reason) => (
                      <label
                        key={reason.code}
                        className="flex cursor-pointer items-start gap-3 rounded border border-border p-3 transition-colors hover:bg-surface-muted"
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason.code}
                          checked={reasonCode === reason.code}
                          onChange={() => {
                            setReasonCode(reason.code);
                            if (reason.code !== 'OTHER') setReasonNote('');
                          }}
                          className="mt-0.5 h-4 w-4 border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-ink">{reason.label}</span>
                      </label>
                    ))}
                  </fieldset>

                  {reasonCode === 'OTHER' ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="cancel-reason-note"
                        className="block text-sm font-medium text-ink"
                      >
                        Lý do khác <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="cancel-reason-note"
                        value={reasonNote}
                        onChange={(event) => setReasonNote(event.target.value)}
                        maxLength={500}
                        rows={4}
                        disabled={pending}
                        autoFocus
                        placeholder="Nhập lý do bạn muốn hủy đơn..."
                        className="w-full resize-y rounded border border-border p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      <p className="text-right text-xs text-ink-subtle">
                        {reasonNote.length}/500
                      </p>
                    </div>
                  ) : null}
                </form>

                <div className="flex justify-end gap-3 border-t border-border bg-surface-muted/50 p-4">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={pending}
                    className="btn-outline px-4 py-2"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    form="cancel-order-form"
                    disabled={pending || !reasonCode}
                    className="btn px-4 py-2 bg-danger text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? 'Đang hủy…' : 'Xác nhận hủy'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
