import { ChangePasswordForm } from './ChangePasswordForm';

export default function PasswordPage() {
  return (
    <div className="card p-5 max-w-2xl">
      <h1 className="text-lg font-semibold">Đổi mật khẩu</h1>
      <p className="text-sm text-ink-muted mt-1 mb-5">
        Để bảo mật, vui lòng không chia sẻ mật khẩu cho người khác.
      </p>
      <ChangePasswordForm />
    </div>
  );
}
