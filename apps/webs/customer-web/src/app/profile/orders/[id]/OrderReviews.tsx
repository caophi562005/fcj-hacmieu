'use client';

import type { ReviewResponse } from '@common/interfaces/models/utility';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createReviewAction, type CreateReviewState } from './actions';

type OrderReviewItem = {
  orderId: string;
  orderItemId: string;
  sellerId: string;
  productId: string;
  productName: string;
  skuValue?: string;
  productImage?: string;
  quantity: number;
};

type OrderReviewsProps = {
  items: OrderReviewItem[];
  initialReviews: Record<string, ReviewResponse | null>;
};

const INITIAL_STATE: CreateReviewState = { ok: false, message: '' };

export function OrderReviews({ items, initialReviews }: OrderReviewsProps) {
  return (
    <div className="card mb-4">
      <div className="px-4 py-3 border-b border-border-subtle font-semibold">
        Đánh giá sản phẩm
      </div>

      <div className="divide-y divide-border-subtle">
        {items.map((item) => (
          <ReviewRow
            key={item.orderItemId}
            item={item}
            review={initialReviews[item.orderItemId] ?? null}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewRow({
  item,
  review,
}: {
  item: OrderReviewItem;
  review: ReviewResponse | null;
}) {
  const router = useRouter();
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [state, formAction] = useActionState(createReviewAction, INITIAL_STATE);

  useEffect(() => {
    if (!state.ok) return;
    setIsWriting(false);
    setContent('');
    setRating(5);
    router.refresh();
  }, [router, state.ok]);

  const createdAtText = useMemo(() => {
    if (!review?.createdAt) return '';
    const d = new Date(review.createdAt);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [review?.createdAt]);

  if (review) {
    return (
      <div className="p-4 flex gap-3">
        <Link
          href={`/product/${item.productId}`}
          className="block cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.productImage || '/placeholder.png'}
            alt={item.productName}
            className="w-14 h-14 rounded object-cover bg-surface-muted"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/product/${item.productId}`}
            className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors cursor-pointer"
          >
            {item.productName}
          </Link>
          <div className="text-xs text-ink-subtle mt-0.5">
            {item.skuValue || 'Mặc định'} · x{item.quantity}
          </div>

          <div className="mt-2 flex items-center gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, idx) => {
              const filled = idx < review.rating;
              return (
                <Star
                  key={idx}
                  className={`w-4 h-4 ${filled ? 'fill-warning text-warning' : 'text-border'}`}
                />
              );
            })}
          </div>

          {review.content ? (
            <p className="text-sm text-ink-muted mt-2 whitespace-pre-line">
              {review.content}
            </p>
          ) : (
            <p className="text-sm text-ink-subtle mt-2">
              Không có nội dung đánh giá.
            </p>
          )}

          {createdAtText ? (
            <p className="text-xs text-ink-subtle mt-2">
              Đã đánh giá lúc {createdAtText}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-3">
      <Link
        href={`/product/${item.productId}`}
        className="block cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.productImage || '/placeholder.png'}
          alt={item.productName}
          className="w-14 h-14 rounded object-cover bg-surface-muted"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link
              href={`/product/${item.productId}`}
              className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors cursor-pointer"
            >
              {item.productName}
            </Link>
            <div className="text-xs text-ink-subtle mt-0.5">
              {item.skuValue || 'Mặc định'} · x{item.quantity}
            </div>
          </div>

          {!isWriting ? (
            <button
              type="button"
              className="btn-primary btn-sm cursor-pointer"
              onClick={() => setIsWriting(true)}
            >
              Đánh giá
            </button>
          ) : null}
        </div>

        {isWriting ? (
          <form action={formAction} className="mt-3 space-y-3">
            <input type="hidden" name="orderId" value={item.orderId} />
            <input type="hidden" name="orderItemId" value={item.orderItemId} />
            <input type="hidden" name="sellerId" value={item.sellerId} />
            <input type="hidden" name="productId" value={item.productId} />
            <input type="hidden" name="rating" value={rating} />

            <div>
              <p className="text-xs text-ink-muted mb-1">Chọn số sao</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const value = idx + 1;
                  const active = value <= rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="p-1 cursor-pointer"
                      aria-label={`Chọn ${value} sao`}
                    >
                      <Star
                        className={`w-5 h-5 ${active ? 'fill-warning text-warning' : 'text-border'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor={`review-content-${item.orderItemId}`}
                className="text-xs text-ink-muted"
              >
                Nội dung đánh giá
              </label>
              <textarea
                id={`review-content-${item.orderItemId}`}
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input w-full min-h-24 mt-1"
                maxLength={1000}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm"
              />
            </div>

            <div className="flex items-center gap-2">
              <SubmitButton />
              <button
                type="button"
                className="btn-outline btn-sm cursor-pointer"
                onClick={() => setIsWriting(false)}
              >
                Hủy
              </button>
            </div>

            {state.message ? (
              <p
                className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`}
                role="status"
                aria-live="polite"
              >
                {state.message}
              </p>
            ) : null}
          </form>
        ) : (
          <p className="text-sm text-ink-subtle mt-2">
            Bạn chưa đánh giá sản phẩm này.
          </p>
        )}
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary btn-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Đang gửi...' : 'Gửi đánh giá'}
    </button>
  );
}
