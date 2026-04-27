'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useActionState, useRef, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { changePasswordAction, type ChangePasswordState } from './actions';

const INITIAL_STATE: ChangePasswordState = { ok: false, message: '' };

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(
    changePasswordAction,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form sau khi đổi mật khẩu thành công.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <PasswordField
        label="Mật khẩu hiện tại"
        name="previousPassword"
        autoComplete="current-password"
      />
      <PasswordField
        label="Mật khẩu mới"
        name="proposedPassword"
        autoComplete="new-password"
      />
      <PasswordField
        label="Nhập lại mật khẩu mới"
        name="confirmPassword"
        autoComplete="new-password"
      />

      <ul className="text-xs text-ink-muted space-y-1 list-disc pl-5">
        <li>Mật khẩu tối thiểu 8 ký tự</li>
        <li>Bao gồm chữ hoa, chữ thường và chữ số</li>
      </ul>

      {state.message && (
        <p
          className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
    </button>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
}: {
  label: string;
  name: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-1">
        <Lock className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          className="input pl-9 pr-10"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </label>
  );
}
