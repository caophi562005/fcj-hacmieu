import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Phone, Lock } from 'lucide-react';
import { loginAction } from './actions';
import { isAuthed } from '../../lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthed()) {
    redirect('/profile');
  }
  const sp = await searchParams;
  const error = sp?.error;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary-700 text-white p-10 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white text-primary font-bold">
              V
            </span>
            <span className="text-xl font-bold">V-Shop</span>
          </Link>
          <h2 className="text-3xl font-bold mt-12 leading-tight max-w-sm">
            Mua sắm thông minh, ưu đãi mỗi ngày
          </h2>
          <p className="mt-3 text-white/90 max-w-sm">
            Hàng triệu sản phẩm chính hãng, giao nhanh toàn quốc, thanh toán an
            toàn — chỉ có tại V-Shop.
          </p>
        </div>
        <div className="relative z-10 text-sm text-white/80">
          © 2024 V-Shop. Mọi quyền được bảo lưu.
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 top-1/3 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary text-white font-bold">
              V
            </span>
            <span className="text-lg font-bold">V-Shop</span>
          </div>
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-sm text-ink-muted mt-1">
            Chào mừng trở lại! Đăng nhập để tiếp tục mua sắm.
          </p>

          <div className="mt-4 rounded bg-accent text-accent-foreground text-xs px-3 py-2">
            <strong>Demo:</strong> Đây là môi trường thử nghiệm. Nhập bất kỳ
            tài khoản và mật khẩu nào để đăng nhập.
          </div>

          {error === 'missing' && (
            <div
              className="mt-3 rounded bg-danger/10 text-danger text-sm px-3 py-2"
              role="alert"
            >
              Vui lòng nhập đầy đủ tài khoản và mật khẩu.
            </div>
          )}

          <form action={loginAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Số điện thoại / Email</span>
              <div className="relative mt-1">
                <Phone className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="id"
                  defaultValue="0901234567"
                  className="input pl-9"
                  placeholder="0901 234 567"
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mật khẩu</span>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  defaultValue="demo1234"
                  className="input pl-9"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="accent-primary" />
                <span className="text-ink-muted">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="#" className="text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <button type="submit" className="btn-primary btn-lg w-full">
              Đăng nhập
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-ink-subtle">
            <span className="flex-1 border-t border-border-subtle" />
            <span>HOẶC</span>
            <span className="flex-1 border-t border-border-subtle" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="btn-outline btn-md">Google</button>
            <button className="btn-outline btn-md">Facebook</button>
          </div>

          <p className="text-sm text-ink-muted text-center mt-6">
            Chưa có tài khoản?{' '}
            <Link href="#" className="text-primary font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
          <div className="text-center mt-3">
            <Link href="/" className="text-sm text-ink-subtle hover:text-primary">
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
