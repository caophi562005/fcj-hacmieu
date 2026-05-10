'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createPromotionAction,
  deletePromotionAction,
  updatePromotionAction,
} from './actions';

function parseNumber(value: FormDataEntryValue | null): number {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

export function PromotionCreateForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await createPromotionAction({
            code: String(formData.get('code') || ''),
            name: String(formData.get('name') || ''),
            description: String(formData.get('description') || ''),
            status: String(formData.get('status') || 'ACTIVE'),
            startsAt: String(formData.get('startsAt') || ''),
            endsAt: String(formData.get('endsAt') || ''),
            scope: String(formData.get('scope') || 'ORDER'),
            minOrderSubtotal: parseNumber(formData.get('minOrderSubtotal')),
            discountType: String(formData.get('discountType') || 'PERCENTAGE'),
            discountValue: parseNumber(formData.get('discountValue')),
            maxDiscount: parseNumber(formData.get('maxDiscount')),
            totalLimit: parseNumber(formData.get('totalLimit')),
          });

          if (res.ok) {
            toast.success('Tạo promotion thành công.');
            e.currentTarget.reset();
          } else {
            toast.error(res.message || 'Tạo promotion thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">
        Tạo chương trình khuyến mãi
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="code" className="input" placeholder="Code" required />
        <input name="name" className="input" placeholder="Name" required />
        <input name="description" className="input" placeholder="Description" />
        <input
          name="status"
          className="input"
          placeholder="Status (ACTIVE/INACTIVE)"
          defaultValue="ACTIVE"
        />
        <input
          name="startsAt"
          className="input"
          placeholder="startsAt (ISO)"
          required
        />
        <input
          name="endsAt"
          className="input"
          placeholder="endsAt (ISO)"
          required
        />
        <input
          name="scope"
          className="input"
          placeholder="Scope"
          defaultValue="ORDER"
        />
        <input
          name="discountType"
          className="input"
          placeholder="discountType"
          defaultValue="PERCENTAGE"
        />
        <input
          name="minOrderSubtotal"
          className="input"
          placeholder="minOrderSubtotal"
          defaultValue="0"
        />
        <input
          name="discountValue"
          className="input"
          placeholder="discountValue"
          defaultValue="0"
        />
        <input
          name="maxDiscount"
          className="input"
          placeholder="maxDiscount"
          defaultValue="0"
        />
        <input
          name="totalLimit"
          className="input"
          placeholder="totalLimit"
          defaultValue="1"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang tạo...' : 'Tạo promotion'}
        </button>
      </div>
    </form>
  );
}

export function PromotionDetailForm({
  promotion,
}: {
  promotion: {
    id: string;
    code: string;
    name: string;
    description: string;
    status: string;
    startsAt: string;
    endsAt: string;
    scope: string;
    discountType: string;
    minOrderSubtotal: number;
    discountValue: number;
    maxDiscount: number;
    totalLimit: number;
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await updatePromotionAction({
            id: promotion.id,
            code: String(formData.get('code') || ''),
            name: String(formData.get('name') || ''),
            description: String(formData.get('description') || ''),
            status: String(formData.get('status') || ''),
            startsAt: String(formData.get('startsAt') || ''),
            endsAt: String(formData.get('endsAt') || ''),
            scope: String(formData.get('scope') || ''),
            discountType: String(formData.get('discountType') || ''),
            minOrderSubtotal: parseNumber(formData.get('minOrderSubtotal')),
            discountValue: parseNumber(formData.get('discountValue')),
            maxDiscount: parseNumber(formData.get('maxDiscount')),
            totalLimit: parseNumber(formData.get('totalLimit')),
          });

          if (res.ok) toast.success('Cập nhật promotion thành công.');
          else toast.error(res.message || 'Cập nhật promotion thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">
          Thông tin khuyến mãi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="code" defaultValue={promotion.code} className="input" />
          <input name="name" defaultValue={promotion.name} className="input" />
          <input
            name="description"
            defaultValue={promotion.description}
            className="input"
          />
          <input
            name="status"
            defaultValue={promotion.status}
            className="input"
          />
          <input
            name="startsAt"
            defaultValue={promotion.startsAt}
            className="input"
          />
          <input
            name="endsAt"
            defaultValue={promotion.endsAt}
            className="input"
          />
          <input
            name="scope"
            defaultValue={promotion.scope}
            className="input"
          />
          <input
            name="discountType"
            defaultValue={promotion.discountType}
            className="input"
          />
          <input
            name="minOrderSubtotal"
            defaultValue={String(promotion.minOrderSubtotal)}
            className="input"
          />
          <input
            name="discountValue"
            defaultValue={String(promotion.discountValue)}
            className="input"
          />
          <input
            name="maxDiscount"
            defaultValue={String(promotion.maxDiscount)}
            className="input"
          />
          <input
            name="totalLimit"
            defaultValue={String(promotion.totalLimit)}
            className="input"
          />
        </div>
      </section>

      <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
        <button
          type="button"
          className="btn-outline btn-md"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const deleteRes = await deletePromotionAction(promotion.id);
              if (deleteRes.ok) {
                toast.success('Xóa promotion thành công.');
                window.location.href = '/promotions';
              } else {
                toast.error(deleteRes.message || 'Xóa promotion thất bại.');
              }
            });
          }}
        >
          Xóa
        </button>
      </div>
    </form>
  );
}
