'use client';

import { Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

type Variant = 'header' | 'page';

type Props = {
  variant?: Variant;
  defaultValue?: string;
  // Khi true: giữ filters hiện tại (categories, minPrice, maxPrice, sortBy,
  // orderBy) — dùng cho search bar nằm trong /search.
  preserveFilters?: boolean;
};

const PRESERVED_KEYS = [
  'categories',
  'minPrice',
  'maxPrice',
  'sortBy',
  'orderBy',
] as const;

// Search bar dùng `router.push` thay vì <form action="/search"> để soft-navigate
// → giữ root layout (Header + SSE) persistent, không re-fetch /iam/user và
// /utility/notification.
export function SearchBar({
  variant = 'page',
  defaultValue,
  preserveFilters = false,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? '');

  // Đồng bộ khi defaultValue đổi (vd: navigate giữa các search query khác nhau)
  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (preserveFilters && sp) {
      for (const key of PRESERVED_KEYS) {
        for (const v of sp.getAll(key)) next.append(key, v);
      }
    }
    const q = value.trim();
    if (q) next.set('q', q);
    const qs = next.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  };

  if (variant === 'header') {
    return (
      <form
        onSubmit={onSubmit}
        role="search"
        className="min-w-0 flex-1 flex items-center h-10 md:h-11 rounded bg-surface-muted hover:bg-white border border-transparent hover:border-primary focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors"
      >
        <SearchIcon className="w-5 h-5 text-ink-subtle ml-3 shrink-0" />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm sản phẩm, thương hiệu, cửa hàng…"
          className="min-w-0 flex-1 bg-transparent border-0 outline-none text-sm px-3 placeholder:text-ink-subtle"
          aria-label="Tìm kiếm"
        />
        <button
          type="submit"
          className="hidden sm:inline-flex items-center justify-center h-full px-4 bg-primary text-white text-sm font-medium rounded-r hover:bg-primary-600 transition-colors cursor-pointer"
        >
          Tìm kiếm
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center h-11 rounded border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
    >
      <SearchIcon className="w-5 h-5 shrink-0 text-ink-subtle ml-3" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm sản phẩm…"
        className="min-w-0 flex-1 bg-transparent border-0 outline-none px-3 text-sm"
        aria-label="Từ khóa tìm kiếm"
      />
      <button
        type="submit"
        className="shrink-0 bg-primary text-white h-full px-5 font-medium hover:bg-primary-600 transition-colors cursor-pointer"
      >
        Tìm
      </button>
    </form>
  );
}
