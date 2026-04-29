'use client';

import { Ticket } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { claimVoucherAction, type ClaimVoucherState } from './actions';

const INITIAL_STATE: ClaimVoucherState = { ok: false, message: '' };

export function ClaimVoucherForm() {
  const [state, formAction] = useActionState(claimVoucherAction, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset input sau khi claim thành công.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            name="code"
            type="text"
            required
            placeholder="Nhập mã voucher"
            autoComplete="off"
            className="input pl-9 w-full uppercase"
          />
        </div>
        <ClaimButton />
      </div>

      {state.message && (
        <p
          className={`text-sm mt-2 ${state.ok ? 'text-success' : 'text-danger'}`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function ClaimButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary btn-md whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {pending ? 'Đang xử lý...' : 'Nhận mã'}
    </button>
  );
}
