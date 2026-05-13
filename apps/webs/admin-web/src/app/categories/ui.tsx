'use client';

import { fileToBase64DataUrl } from '@common/web-core/lib/image-base64';
import {
  ALLOWED_IMAGE_MIME,
  IMAGE_ACCEPT,
} from '@common/web-core/lib/image-constants';
import { ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from './actions';

type CategoryViewModel = {
  id: string;
  name: string;
  logo: string | null;
  parentCategoryId: string | null;
};

function CategoryLogoPicker({
  logo,
  logoBase64,
  onLogoBase64Change,
}: {
  logo: string;
  logoBase64: string;
  onLogoBase64Change: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const logoPreview = logoBase64 || logo;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ink">Logo</label>
      <div className="border border-slate-200 rounded-xl p-3 bg-surface-muted/30">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;

            if (
              !ALLOWED_IMAGE_MIME.includes(
                file.type as (typeof ALLOWED_IMAGE_MIME)[number],
              )
            ) {
              toast.error('Chỉ hỗ trợ ảnh PNG/JPG/JPEG/WEBP.');
              return;
            }

            try {
              const base64DataUrl = await fileToBase64DataUrl(file);
              onLogoBase64Change(base64DataUrl);
            } catch {
              toast.error('Đọc ảnh thất bại. Vui lòng thử lại.');
            }
          }}
        />

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Category logo preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-ink-subtle" />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-outline btn-sm cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              Upload ảnh
            </button>
            <button
              type="button"
              className="btn-outline btn-sm cursor-pointer"
              disabled={!logoBase64}
              onClick={() => onLogoBase64Change('')}
            >
              Bỏ ảnh upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryCreateForm({
  parentCategoryId,
}: {
  parentCategoryId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [logoBase64, setLogoBase64] = useState('');

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        startTransition(async () => {
          const res = await createCategoryAction({
            name,
            logoBase64: logoBase64 || undefined,
            ...(parentCategoryId ? { parentCategoryId } : {}),
          });

          if (res.ok) {
            toast.success('Tạo category thành công.');
            setName('');
            setLogoBase64('');
          } else {
            toast.error(res.message || 'Tạo category thất bại.');
          }
        });
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Tạo danh mục mới</h2>
        {parentCategoryId && (
          <span className="text-xs px-2 py-1 rounded-full border border-primary-200 text-primary bg-primary-50">
            Parent: {parentCategoryId.slice(0, 8)}…
          </span>
        )}
      </div>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên category"
          className="input"
          required
        />
        <CategoryLogoPicker
          logo=""
          logoBase64={logoBase64}
          onLogoBase64Change={setLogoBase64}
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
  showDelete = true,
  onSaved,
  onDeleted,
}: {
  category: CategoryViewModel;
  showDelete?: boolean;
  onSaved?: () => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category.name);
  const [logoBase64, setLogoBase64] = useState('');

  return (
    <form
      className="card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();

        startTransition(async () => {
          const updateRes = await updateCategoryAction({
            id: category.id,
            name,
            logo: category.logo || '',
            logoBase64: logoBase64 || undefined,
            parentCategoryId: category.parentCategoryId || undefined,
          });

          if (updateRes.ok) {
            toast.success('Cập nhật category thành công.');
            setLogoBase64('');
            onSaved?.();
            router.refresh();
          } else {
            toast.error(updateRes.message || 'Cập nhật category thất bại.');
          }
        });
      }}
    >
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Thông tin danh mục</h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
          <CategoryLogoPicker
            logo={category.logo || ''}
            logoBase64={logoBase64}
            onLogoBase64Change={setLogoBase64}
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

        {showDelete && (
          <button
            type="button"
            className="btn-outline btn-md"
            disabled={isPending}
            onClick={() => {
              if (!confirm('Bạn chắc chắn muốn xoá category này?')) return;
              startTransition(async () => {
                const deleteRes = await deleteCategoryAction(category.id);
                if (deleteRes.ok) {
                  toast.success('Xóa category thành công.');
                  onDeleted?.();
                  if (!onDeleted) {
                    router.push('/categories');
                  }
                } else {
                  toast.error(deleteRes.message || 'Xóa category thất bại.');
                }
              });
            }}
          >
            Xóa
          </button>
        )}
      </div>
    </form>
  );
}

export function CategoryLinkCard({
  category,
}: {
  category: CategoryViewModel;
}) {
  return (
    <Link
      href={`/categories/${category.id}`}
      className="card p-4 hover:bg-primary-50/40 border border-slate-200 transition-colors duration-200 cursor-pointer block"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
          {category.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.logo}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-ink-subtle" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {category.name}
          </p>
          <p className="text-xs text-ink-muted font-mono truncate">
            {category.id}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ChildCategoryDialogCard({
  category,
}: {
  category: CategoryViewModel;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="card p-4 hover:bg-primary-50/40 border border-slate-200 transition-colors duration-200 cursor-pointer text-left w-full"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
            {category.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={category.logo}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-ink-subtle" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              {category.name}
            </p>
            <p className="text-xs text-ink-muted font-mono truncate">
              {category.id}
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-3">
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
            <CategoryDetailForm
              category={category}
              onSaved={() => setOpen(false)}
              onDeleted={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
