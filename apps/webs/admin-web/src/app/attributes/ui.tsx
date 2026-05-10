'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createAttributeAction,
  deleteAttributeAction,
  updateAttributeAction,
} from './actions';

export function AttributeCreateForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await createAttributeAction({
            name: String(formData.get('name') || ''),
            url: String(formData.get('url') || ''),
          });
          if (res.ok) {
            toast.success('Tạo attribute thành công.');
            e.currentTarget.reset();
          } else {
            toast.error(res.message || 'Tạo attribute thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">Tạo thuộc tính mới</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          name="name"
          placeholder="Tên thuộc tính"
          className="input"
          required
        />
        <input
          name="url"
          placeholder="URL thuộc tính"
          className="input"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary btn-md"
          disabled={isPending}
        >
          {isPending ? 'Đang tạo...' : 'Tạo attribute'}
        </button>
      </div>
    </form>
  );
}

export function AttributeDetailForm({
  attribute,
}: {
  attribute: {
    id: string;
    name: string;
    url: string;
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
          const updateRes = await updateAttributeAction({
            id: attribute.id,
            name: String(formData.get('name') || ''),
            url: String(formData.get('url') || ''),
          });
          if (updateRes.ok) toast.success('Cập nhật attribute thành công.');
          else toast.error(updateRes.message || 'Cập nhật attribute thất bại.');
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">
          Thông tin thuộc tính
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            defaultValue={attribute.name}
            className="input"
            required
          />
          <input
            name="url"
            defaultValue={attribute.url}
            className="input"
            required
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
              const deleteRes = await deleteAttributeAction(attribute.id);
              if (deleteRes.ok) {
                toast.success('Xóa attribute thành công.');
                window.location.href = '/attributes';
              } else {
                toast.error(deleteRes.message || 'Xóa attribute thất bại.');
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
