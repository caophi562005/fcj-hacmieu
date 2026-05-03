import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  page: number;
  totalPages: number;
  buildHref: (nextPage: number) => string;
  ariaLabel?: string;
};

type PageValue = number | '...';

function buildPageList(page: number, totalPages: number): PageValue[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(pages)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const out: PageValue[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && current - prev > 1) out.push('...');
    out.push(current);
  }

  return out;
}

function PageButton({
  href,
  children,
  disabled,
  active,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={disabled ? '#' : href}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={`h-9 min-w-9 px-3 rounded-md border text-sm inline-flex items-center justify-center transition-colors duration-200 cursor-pointer ${
        active
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-surface hover:border-primary hover:text-primary'
      } ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''}`}
    >
      {children}
    </Link>
  );
}

export function Pagination({
  page,
  totalPages,
  buildHref,
  ariaLabel = 'Phân trang',
}: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-1"
      aria-label={ariaLabel}
    >
      <PageButton
        href={buildHref(Math.max(1, page - 1))}
        disabled={page <= 1}
        ariaLabel="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageButton>

      {pages.map((value, idx) =>
        value === '...' ? (
          <span key={`gap-${idx}`} className="px-2 text-ink-subtle">
            …
          </span>
        ) : (
          <PageButton
            key={value}
            href={buildHref(value)}
            active={value === page}
          >
            {value}
          </PageButton>
        ),
      )}

      <PageButton
        href={buildHref(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        ariaLabel="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </PageButton>
    </nav>
  );
}
