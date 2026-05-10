'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createBrandAction,
  deleteBrandAction,
  updateBrandAction,
} from './actions';

export function BrandCreateForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await createBrandAction({
            name: String(formData.get('name') || ''),
            logo: String(formData.get('logo') || ''),
          });
          if (res.ok) {
            toast.success('Tạo brand thành công.');
            e.currentTarget.reset();
          } else {
            toast.error(res.message || 'Tạo brand thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">Tạo thương hiệu mới</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="name"
          placeholder="Tên thương hiệu"
          className="input"
          required
        />
        <input name="logo" placeholder="Logo URL" className="input" />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang tạo...' : 'Tạo brand'}
        </button>
      </div>
    </form>
  );
}

export function BrandDetailForm({
  brand,
}: {
  brand: {
    id: string;
    name: string;
    logo: string | null;
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
          const updateRes = await updateBrandAction({
            id: brand.id,
            name: String(formData.get('name') || ''),
            logo: String(formData.get('logo') || ''),
          });
          if (updateRes.ok) toast.success('Cập nhật brand thành công.');
          else toast.error(updateRes.message || 'Cập nhật brand thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">
          Thông tin thương hiệu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            defaultValue={brand.name}
            className="input"
            required
          />
          <input
            name="logo"
            defaultValue={brand.logo || ''}
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
              const deleteRes = await deleteBrandAction(brand.id);
              if (deleteRes.ok) {
                toast.success('Xóa brand thành công.');
                window.location.href = '/brands';
              } else {
                toast.error(deleteRes.message || 'Xóa brand thất bại.');
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
