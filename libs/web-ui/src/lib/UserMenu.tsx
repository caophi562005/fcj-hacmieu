'use client';

import {
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  X,
} from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { createPortal, useFormStatus } from 'react-dom';

export type ChangePasswordState = { ok: boolean; message: string };

const INITIAL_STATE: ChangePasswordState = { ok: false, message: '' };

type Props = {
  user: { name: string; email: string; avatar: string };
  logoutAction: () => Promise<void>;
  changePasswordAction: (
    state: ChangePasswordState,
    formData: FormData,
  ) => Promise<ChangePasswordState>;
};

export function UserMenu({ user, logoutAction, changePasswordAction }: Props) {
  const [open, setOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when click outside / press Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-muted transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden md:block text-sm leading-tight text-left">
            <div className="font-semibold text-ink truncate max-w-[140px]">
              {user.name}
            </div>
            <div className="text-ink-subtle text-xs truncate max-w-[140px]">
              {user.email}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white border border-slate-100 shadow-floating overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {user.name}
                </p>
                <p className="text-xs text-ink-subtle truncate">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setShowPasswordModal(true);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-ink hover:bg-surface-muted transition-colors"
            >
              <KeyRound className="w-4 h-4 text-ink-muted" />
              Đổi mật khẩu
            </button>

            <form action={logoutAction}>
              <LogoutButton />
            </form>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          changePasswordAction={changePasswordAction}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-danger hover:bg-red-50 border-t border-slate-100 transition-colors disabled:opacity-60"
    >
      <LogOut className="w-4 h-4" />
      {pending ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </button>
  );
}

function ChangePasswordModal({
  changePasswordAction,
  onClose,
}: {
  changePasswordAction: (
    state: ChangePasswordState,
    formData: FormData,
  ) => Promise<ChangePasswordState>;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(
    changePasswordAction,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [mounted, setMounted] = useState(false);

  // SSR safety: chỉ portal sau khi mount để có document.body
  useEffect(() => setMounted(true), []);

  // Reset form khi đổi mật khẩu thành công, đóng modal sau 1.2s
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
    return;
  }, [state, onClose]);

  // Khoá scroll body khi modal mở + Escape để đóng
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  // Render qua portal vào body để THOÁT containing block của topbar
  // (topbar có backdrop-blur-md → tạo containing block cho `position: fixed`).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cp-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-md shadow-floating overflow-hidden animate-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 id="cp-title" className="text-lg font-semibold text-ink">
            Đổi mật khẩu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-muted text-ink-muted flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="p-5 space-y-4">
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

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline btn-md"
            >
              Hủy
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>,
    document.body,
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
      <span className="text-sm font-semibold text-ink-muted">{label}</span>
      <div className="relative mt-1.5">
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
