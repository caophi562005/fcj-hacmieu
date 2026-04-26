import Link from 'next/link';
import { Star } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  sold?: string;
  image: string;
  discount?: number;
  badge?: string;
};

export const formatVnd = (n: number) =>
  n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '₫';

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/product/${p.id}`}
      className="group flex flex-col bg-white rounded-md shadow-card border border-transparent hover:border-primary/30 hover:shadow-floating transition-all overflow-hidden"
    >
      <div className="relative aspect-square bg-surface-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {p.discount ? (
          <span className="absolute top-2 left-2 chip-flash">-{p.discount}%</span>
        ) : null}
        {p.badge ? (
          <span className="absolute top-2 right-2 chip">{p.badge}</span>
        ) : null}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h3 className="text-sm text-ink line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {p.name}
        </h3>
        <div className="text-price-md text-primary">{formatVnd(p.price)}</div>
        <div className="flex items-center gap-1 text-xs text-ink-subtle mt-auto">
          {typeof p.rating === 'number' && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{p.rating.toFixed(1)}</span>
            </span>
          )}
          {p.sold && (
            <>
              <span>·</span>
              <span>Đã bán {p.sold}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
