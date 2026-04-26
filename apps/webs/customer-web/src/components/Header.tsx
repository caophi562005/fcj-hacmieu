import Link from 'next/link';
import { Search, ShoppingCart, Bell, MessageCircle } from 'lucide-react';
import { getAuth } from '../lib/auth';

export async function Header({ cartCount = 3 }: { cartCount?: number }) {
  const user = await getAuth();
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-card">
      <div className="container-page flex items-center gap-3 md:gap-6 h-14 md:h-16">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 select-none"
          aria-label="V-Shop trang chủ"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white font-bold">
            V
          </span>
          <span className="hidden md:block text-lg font-bold text-ink">
            V-Shop
          </span>
        </Link>

        <form
          action="/search"
          className="flex-1 flex items-center h-10 md:h-11 rounded bg-surface-muted hover:bg-white border border-transparent hover:border-primary focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
        >
          <Search className="w-5 h-5 text-ink-subtle ml-3 shrink-0" />
          <input
            type="search"
            name="q"
            placeholder="Tìm sản phẩm, thương hiệu, cửa hàng…"
            className="flex-1 bg-transparent border-0 outline-none text-sm px-3 placeholder:text-ink-subtle"
            aria-label="Tìm kiếm"
          />
          <button
            type="submit"
            className="hidden sm:inline-flex items-center justify-center h-full px-4 bg-primary text-white text-sm font-medium rounded-r hover:bg-primary-600 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href={user ? '/profile/notifications' : '/login'}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {user && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
            )}
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center w-10 h-10 rounded text-ink-muted hover:text-primary hover:bg-surface-muted transition-colors"
            aria-label="Tin nhắn"
          >
            <MessageCircle className="w-5 h-5" />
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="ml-2 inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full hover:bg-surface-muted transition-colors"
              aria-label="Tài khoản"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium max-w-[120px] truncate">
                {user.name}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="ml-2 btn-primary btn-sm">
              Đăng nhập
            </Link>
          )}
        </nav>

        <Link
          href="/cart"
          className="md:hidden relative inline-flex items-center justify-center w-10 h-10 text-ink-muted"
          aria-label="Giỏ hàng"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
