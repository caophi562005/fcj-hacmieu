'use client';

import { useActionState } from 'react';
import { createPlacementAction, type PlacementActionState } from './actions';

const initialState: PlacementActionState = { ok: false, message: '' };

export function PurchasePlacementForm({
  products,
  allowedDurations,
  disabled,
}: {
  products: { id: string; name: string }[];
  allowedDurations: number[];
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(
    createPlacementAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="card grid gap-4 p-6 md:grid-cols-[1fr_180px_auto] md:items-end"
    >
      <label className="space-y-2">
        <span className="text-sm font-medium">Sản phẩm đang hoạt động</span>
        <select name="productId" required className="input w-full">
          <option value="">Chọn sản phẩm</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Thời hạn</span>
        <select name="durationDays" className="input w-full">
          {allowedDurations.map((days) => (
            <option key={days} value={days}>
              {days} ngày
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={disabled || pending}
        className="btn-primary btn-md"
      >
        {pending ? 'Đang xử lý...' : 'Mua vị trí'}
      </button>
      {state.message && (
        <p
          className={`text-sm md:col-span-3 ${state.ok ? 'text-success' : 'text-danger'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
