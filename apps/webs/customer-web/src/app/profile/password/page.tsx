import { Lock } from 'lucide-react';

export default function PasswordPage() {
  return (
    <div className="card p-5 max-w-2xl">
      <h1 className="text-lg font-semibold">Đổi mật khẩu</h1>
      <p className="text-sm text-ink-muted mt-1 mb-5">
        Để bảo mật, vui lòng không chia sẻ mật khẩu cho người khác.
      </p>
      <form className="space-y-4">
        {[
          { label: 'Mật khẩu hiện tại' },
          { label: 'Mật khẩu mới' },
          { label: 'Nhập lại mật khẩu mới' },
        ].map((f) => (
          <label key={f.label} className="block">
            <span className="text-sm font-medium">{f.label}</span>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" className="input pl-9" placeholder="••••••••" />
            </div>
          </label>
        ))}
        <ul className="text-xs text-ink-muted space-y-1 list-disc pl-5">
          <li>Mật khẩu tối thiểu 8 ký tự</li>
          <li>Bao gồm chữ hoa, chữ thường và chữ số</li>
        </ul>
        <button className="btn-primary btn-md">Cập nhật mật khẩu</button>
      </form>
    </div>
  );
}
