'use client';

import { X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createAttributeAction,
  deleteAttributeAction,
  getAttributeByIdAction,
  updateAttributeAction,
} from './actions';

type AttributeViewModel = {
  id: string;
  name: string;
};

export function AttributeCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        startTransition(async () => {
          const res = await createAttributeAction({
            name,
          });
          if (res.ok) {
            toast.success('Tạo attribute thành công.');
            setName('');
          } else {
            toast.error(res.message || 'Tạo attribute thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">Tạo thuộc tính mới</h2>
      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên thuộc tính"
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

export function AttributeDialogCard({
  attribute,
}: {
  attribute: AttributeViewModel;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [detail, setDetail] = useState<{
    id: string;
    name: string;
    url?: string;
  } | null>(null);
  const [name, setName] = useState('');

  const openDialog = () => {
    setOpen(true);
    startTransition(async () => {
      const res = await getAttributeByIdAction(attribute.id);
      if (!res.ok || !res.data) {
        toast.error(res.message || 'Không tải được thông tin attribute.');
        return;
      }
      const attributeData = {
        id: res.data.id,
        name: res.data.name,
        url: res.data.url,
      };
      setDetail(attributeData);
      setName(attributeData.name);
    });
  };

  return (
    <>
      <button
        type="button"
        className="card p-4 hover:bg-primary-50/40 border border-slate-200 transition-colors duration-200 cursor-pointer text-left w-full"
        onClick={openDialog}
      >
        <p className="text-sm font-semibold text-ink truncate">
          {attribute.name}
        </p>
        <p className="text-xs text-ink-muted font-mono truncate mt-1">
          {attribute.id}
        </p>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white text-ink-muted hover:text-ink hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                aria-label="Đóng dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              className="card p-6 md:p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!detail) return;

                startTransition(async () => {
                  const updateRes = await updateAttributeAction({
                    id: detail.id,
                    name,
                    url: detail.url,
                  });
                  if (updateRes.ok) {
                    toast.success('Cập nhật attribute thành công.');
                    setOpen(false);
                  } else {
                    toast.error(
                      updateRes.message || 'Cập nhật attribute thất bại.',
                    );
                  }
                });
              }}
            >
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-ink">
                  Thông tin thuộc tính
                </h2>
                {detail ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    required
                  />
                ) : (
                  <div className="text-sm text-ink-muted">
                    Đang tải thông tin attribute...
                  </div>
                )}
              </section>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="submit"
                  className="btn-primary btn-md"
                  disabled={isPending || !detail}
                >
                  {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  className="btn-outline btn-md"
                  disabled={isPending || !detail}
                  onClick={() => {
                    if (!detail) return;
                    if (!confirm('Bạn chắc chắn muốn xoá attribute này?'))
                      return;
                    startTransition(async () => {
                      const deleteRes = await deleteAttributeAction(detail.id);
                      if (deleteRes.ok) {
                        toast.success('Xóa attribute thành công.');
                        setOpen(false);
                      } else {
                        toast.error(
                          deleteRes.message || 'Xóa attribute thất bại.',
                        );
                      }
                    });
                  }}
                >
                  Xóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function AttributeGrid({
  attributes,
}: {
  attributes: AttributeViewModel[];
}) {
  if (attributes.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-muted">
        Không có attribute.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {attributes.map((attribute) => (
        <AttributeDialogCard key={attribute.id} attribute={attribute} />
      ))}
    </div>
  );
}
