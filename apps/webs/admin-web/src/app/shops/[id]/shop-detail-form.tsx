'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateShopAction } from '../actions';

export function ShopDetailForm({
  shop,
}: {
  shop: {
    id: string;
    name: string;
    description: string;
    status: string;
    logo: string | null;
    banner: string | null;
    phone: string | null;
    pickupAddress: string | null;
    returnAddress: string | null;
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
          const res = await updateShopAction({
            id: shop.id,
            name: String(formData.get('name') || ''),
            description: String(formData.get('description') || ''),
            status: String(formData.get('status') || ''),
            logo: String(formData.get('logo') || ''),
            banner: String(formData.get('banner') || ''),
            phone: String(formData.get('phone') || ''),
            pickupAddress: String(formData.get('pickupAddress') || ''),
            returnAddress: String(formData.get('returnAddress') || ''),
          });

          if (res.ok) toast.success('Cập nhật shop thành công.');
          else toast.error(res.message || 'Cập nhật shop thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Thông tin shop</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            defaultValue={shop.name}
            className="input"
            required
          />
          <input name="status" defaultValue={shop.status} className="input" />
          <input name="logo" defaultValue={shop.logo || ''} className="input" />
          <input
            name="banner"
            defaultValue={shop.banner || ''}
            className="input"
          />
          <input
            name="phone"
            defaultValue={shop.phone || ''}
            className="input"
          />
          <input
            name="pickupAddress"
            defaultValue={shop.pickupAddress || ''}
            className="input"
          />
          <input
            name="returnAddress"
            defaultValue={shop.returnAddress || ''}
            className="input"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Mô tả</h2>
        <textarea
          name="description"
          defaultValue={shop.description}
          className="input min-h-28"
        />
      </section>

      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang cập nhật...' : 'Cập nhật shop'}
        </button>
      </div>
    </form>
  );
}
