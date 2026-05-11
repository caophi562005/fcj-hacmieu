import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ServiceUnavailablePage() {
  return (
    <section className="min-h-[calc(100vh-7rem)] w-full flex items-center justify-center px-4">
      <div className="relative max-w-2xl w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-floating">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-100/80 blur-3xl" />

        <div className="relative p-8 md:p-10 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.2em] text-ink-subtle">
              ERROR 503
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-ink">
              Dịch vụ tạm thời không khả dụng
            </h1>
            <p className="text-sm md:text-base text-ink-muted max-w-xl mx-auto">
              Tài khoản hiện tại không có quyền truy cập Admin Center hoặc hệ
              thống đang giới hạn truy cập tạm thời.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="btn-outline btn-md w-full sm:w-auto">
              <RefreshCcw className="w-4 h-4" />
              Thử lại
            </Link>
            <Link href="/login" className="btn-primary btn-md w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
