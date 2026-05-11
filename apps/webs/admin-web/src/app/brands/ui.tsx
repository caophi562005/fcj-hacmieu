'use client';

import { ImageIcon, X } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { fileToBase64DataUrl } from '../../lib/image-base64';
import {
  createBrandAction,
  deleteBrandAction,
  getBrandByIdAction,
  updateBrandAction,
} from './actions';

type BrandViewModel = {
  id: string;
  name: string;
  logo: string | null;
};

const ALLOWED_IMAGE_MIME = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

function BrandLogoPicker({
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
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (!file) return;

            if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
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
                alt="Brand logo preview"
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

export function BrandCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [logoBase64, setLogoBase64] = useState('');

  return (
    <form
      className="card p-5 md:p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        startTransition(async () => {
          const res = await createBrandAction({
            name,
            logoBase64: logoBase64 || undefined,
          });
          if (res.ok) {
            toast.success('Tạo brand thành công.');
            setName('');
            setLogoBase64('');
          } else {
            toast.error(res.message || 'Tạo brand thất bại.');
          }
        });
      }}
    >
      <h2 className="text-base font-semibold text-ink">Tạo thương hiệu mới</h2>
      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên thương hiệu"
          className="input"
          required
        />
        <BrandLogoPicker
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
          {isPending ? 'Đang tạo...' : 'Tạo brand'}
        </button>
      </div>
    </form>
  );
}

export function BrandDialogCard({ brand }: { brand: BrandViewModel }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [detail, setDetail] = useState<BrandViewModel | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [logoBase64, setLogoBase64] = useState('');

  const openDialog = () => {
    setOpen(true);
    startTransition(async () => {
      const res = await getBrandByIdAction(brand.id);
      if (!res.ok || !res.data) {
        toast.error(res.message || 'Không tải được thông tin brand.');
        return;
      }
      const brandData = {
        id: res.data.id,
        name: res.data.name,
        logo: res.data.logo,
      };
      setDetail(brandData);
      setName(brandData.name);
      setLogo(brandData.logo || '');
      setLogoBase64('');
    });
  };

  return (
    <>
      <button
        type="button"
        className="card p-4 hover:bg-primary-50/40 border border-slate-200 transition-colors duration-200 cursor-pointer text-left w-full"
        onClick={openDialog}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-ink-subtle" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              {brand.name}
            </p>
            <p className="text-xs text-ink-muted font-mono truncate">
              {brand.id}
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

            <form
              className="card p-6 md:p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (!detail) return;

                startTransition(async () => {
                  const updateRes = await updateBrandAction({
                    id: detail.id,
                    name,
                    logo,
                    logoBase64: logoBase64 || undefined,
                  });
                  if (updateRes.ok) {
                    toast.success('Cập nhật brand thành công.');
                    setLogoBase64('');
                    setOpen(false);
                  } else {
                    toast.error(
                      updateRes.message || 'Cập nhật brand thất bại.',
                    );
                  }
                });
              }}
            >
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-ink">
                  Thông tin thương hiệu
                </h2>
                {detail ? (
                  <div className="space-y-3">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      required
                    />
                    <BrandLogoPicker
                      logo={logo}
                      logoBase64={logoBase64}
                      onLogoBase64Change={setLogoBase64}
                    />
                  </div>
                ) : (
                  <div className="text-sm text-ink-muted">
                    Đang tải thông tin brand...
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
                    if (!confirm('Bạn chắc chắn muốn xoá brand này?')) return;

                    startTransition(async () => {
                      const deleteRes = await deleteBrandAction(detail.id);
                      if (deleteRes.ok) {
                        toast.success('Xóa brand thành công.');
                        setOpen(false);
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
          </div>
        </div>
      )}
    </>
  );
}

export function BrandGrid({ brands }: { brands: BrandViewModel[] }) {
  if (brands.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-muted">
        Không có brand.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {brands.map((brand) => (
        <BrandDialogCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
