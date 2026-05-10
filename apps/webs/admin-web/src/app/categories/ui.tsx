'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from './actions';

export function CategoryCreateForm({
  parentCategoryId,
}: {
  parentCategoryId?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await createCategoryAction({
            name: String(formData.get('name') || ''),
            logo: String(formData.get('logo') || ''),
            parentCategoryId: String(
              formData.get('parentCategoryId') || parentCategoryId || '',
            ),
          });
          if (res.ok) {
            toast.success('Tạo category thành công.');
            e.currentTarget.reset();
          } else {
            toast.error(res.message || 'Tạo category thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">Tạo danh mục mới</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="name"
          placeholder="Tên category"
          className="input"
          required
        />
        <input name="logo" placeholder="Logo URL" className="input" />
        <input
          name="parentCategoryId"
          placeholder="Parent category id"
          className="input"
          defaultValue={parentCategoryId || ''}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang tạo...' : 'Tạo category'}
        </button>
      </div>
    </form>
  );
}

export function CategoryDetailForm({
  category,
}: {
  category: {
    id: string;
    name: string;
    logo: string | null;
    parentCategoryId: string | null;
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
          const updateRes = await updateCategoryAction({
            id: category.id,
            name: String(formData.get('name') || ''),
            logo: String(formData.get('logo') || ''),
            parentCategoryId: String(formData.get('parentCategoryId') || ''),
          });

          if (updateRes.ok) toast.success('Cập nhật category thành công.');
          else toast.error(updateRes.message || 'Cập nhật category thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Thông tin danh mục</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            defaultValue={category.name}
            className="input"
            required
          />
          <input
            name="logo"
            defaultValue={category.logo || ''}
            className="input"
          />
          <input
            name="parentCategoryId"
            defaultValue={category.parentCategoryId || ''}
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
              const deleteRes = await deleteCategoryAction(category.id);
              if (deleteRes.ok) {
                toast.success('Xóa category thành công.');
                window.location.href = '/categories';
              } else {
                toast.error(deleteRes.message || 'Xóa category thất bại.');
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
