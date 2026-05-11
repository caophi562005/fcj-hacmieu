'use client';

import { Building2, ImagePlus, Store, Undo2, Wallet } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { fileToBase64DataUrl } from '../../../lib/image-base64';
import { updateShopAction } from '../actions';

const SHOP_STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const;
const SHOP_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ngưng',
  CLOSED: 'Đã đóng',
};
const ALLOWED_IMAGE_MIME = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

export function ShopDetailForm({
  shop,
}: {
  shop: {
    id: string;
    merchantId: string;
    name: string;
    description: string;
    status: string;
    logo: string | null;
    banner: string | null;
    phone: string | null;
    pickupAddress: string | null;
    returnAddress: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankCode: string | null;
    bankAccountName: string | null;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [logoNewBase64, setLogoNewBase64] = useState<string | null>(null);
  const [bannerNewBase64, setBannerNewBase64] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const logoPreview = logoNewBase64 ?? shop.logo;
  const bannerPreview = bannerNewBase64 ?? shop.banner;

  const onPickImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
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
      setter(base64DataUrl);
    } catch {
      toast.error('Đọc ảnh thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form
      className="card p-6 md:p-8 space-y-6 max-w-4xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await updateShopAction({
            id: shop.id,
            merchantId: shop.merchantId,
            name: String(formData.get('name') || ''),
            description: String(formData.get('description') || ''),
            status: String(formData.get('status') || ''),
            logo: shop.logo || '',
            banner: shop.banner || '',
            logoBase64: logoNewBase64 || undefined,
            bannerBase64: bannerNewBase64 || undefined,
            phone: String(formData.get('phone') || ''),
            pickupAddress: String(formData.get('pickupAddress') || ''),
            returnAddress: String(formData.get('returnAddress') || ''),
            bankName: shop.bankName || '',
            bankAccountNumber: shop.bankAccountNumber || '',
            bankCode: shop.bankCode || '',
            bankAccountName: shop.bankAccountName || '',
          });

          if (res.ok) toast.success('Cập nhật shop thành công.');
          else toast.error(res.message || 'Cập nhật shop thất bại.');
        });
      }}
    >
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" />
          Thông tin shop
        </h2>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(event) => onPickImage(event, setLogoNewBase64)}
          />
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(event) => onPickImage(event, setBannerNewBase64)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Logo shop</p>
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt={shop.name}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-ink-muted">
                Chưa có logo
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted hover:text-primary hover:border-primary hover:bg-primary-50/40 transition-colors duration-200 cursor-pointer"
              >
                <ImagePlus className="w-4 h-4" />
                Tải logo
              </button>
              <button
                type="button"
                onClick={() => setLogoNewBase64(null)}
                disabled={!logoNewBase64}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted enabled:hover:text-danger enabled:hover:border-red-200 enabled:hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-4 h-4" />
                Hoàn tác ảnh
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Banner shop</p>
            {bannerPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerPreview}
                alt={`${shop.name} banner`}
                className="w-full max-w-xs h-20 rounded-lg object-cover border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-full max-w-xs h-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-ink-muted">
                Chưa có banner
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted hover:text-primary hover:border-primary hover:bg-primary-50/40 transition-colors duration-200 cursor-pointer"
              >
                <ImagePlus className="w-4 h-4" />
                Tải banner
              </button>
              <button
                type="button"
                onClick={() => setBannerNewBase64(null)}
                disabled={!bannerNewBase64}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-200 text-sm text-ink-muted enabled:hover:text-danger enabled:hover:border-red-200 enabled:hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-4 h-4" />
                Hoàn tác ảnh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            name="merchantId"
            label="Mã merchant"
            defaultValue={shop.merchantId}
            disabled
          />
          <Field
            name="name"
            label="Tên shop"
            defaultValue={shop.name}
            required
          />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Trạng thái
            </label>
            <select
              name="status"
              defaultValue={shop.status}
              className="input cursor-pointer"
            >
              {SHOP_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {SHOP_STATUS_LABEL[status] ?? status}
                </option>
              ))}
            </select>
          </div>
          <Field
            name="phone"
            label="Số điện thoại"
            defaultValue={shop.phone || ''}
          />
          <Field
            name="pickupAddress"
            label="Địa chỉ lấy hàng"
            defaultValue={shop.pickupAddress || ''}
          />
          <Field
            name="returnAddress"
            label="Địa chỉ trả hàng"
            defaultValue={shop.returnAddress || ''}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Mô tả & địa chỉ
        </h2>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Mô tả shop
        </label>
        <textarea
          name="description"
          defaultValue={shop.description}
          className="input min-h-28"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Tài khoản nhận thanh toán
        </h2>
        <fieldset
          disabled
          className="rounded-lg border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Field
            name="bankName"
            label="Tên ngân hàng"
            defaultValue={shop.bankName || ''}
            disabled
          />
          <Field
            name="bankCode"
            label="Mã ngân hàng"
            defaultValue={shop.bankCode || ''}
            disabled
          />
          <Field
            name="bankAccountName"
            label="Tên chủ tài khoản"
            defaultValue={shop.bankAccountName || ''}
            disabled
          />
          <Field
            name="bankAccountNumber"
            label="Số tài khoản"
            defaultValue={shop.bankAccountNumber || ''}
            disabled
          />
        </fieldset>
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

function Field({
  label,
  name,
  defaultValue,
  required,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="input"
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
