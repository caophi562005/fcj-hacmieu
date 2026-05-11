import { Compass, Home, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh-7rem)] w-full flex items-center justify-center px-4">
      <div className="relative max-w-2xl w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-floating">
        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />

        <div className="relative p-8 md:p-10 text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <SearchX className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.2em] text-ink-subtle">
              ERROR 404
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-ink">
              Trang không tồn tại
            </h1>
            <p className="text-sm md:text-base text-ink-muted max-w-xl mx-auto">
              Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không còn khả dụng
              trong Admin Center.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="btn-primary btn-md w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Về Dashboard
            </Link>
            <Link href="/users" className="btn-outline btn-md w-full sm:w-auto">
              <Compass className="w-4 h-4" />
              Đi tới Users
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
