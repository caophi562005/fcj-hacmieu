'use client';

import { ShopStatusEnums } from '@common/schemas/shop';
import { ImagePlus, Save, Store, Undo2, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react';
import { toast } from 'react-toastify';
import { fileToBase64DataUrl } from '../../../lib/image-base64';
import { createShopAction, updateShopAction } from '../actions';

type ShopStatus = (typeof ShopStatusEnums)['options'][number];

const STATUS_LABEL: Record<ShopStatus, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Tạm ngừng',
  CLOSED: 'Đã đóng',
};

const ALLOWED_IMAGE_MIME = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_IMAGE_SIZE_MB = 5;

export type ShopFormInitial = {
  name: string;
  description: string;
  phone: string;
  status: ShopStatus;
  logo: string | null;
  banner: string | null;
  pickupAddress: string | null;
  returnAddress: string | null;
};

export const EMPTY_SHOP: ShopFormInitial = {
  name: '',
  description: '',
  phone: '',
  status: 'DRAFT',
  logo: null,
  banner: null,
  pickupAddress: '',
  returnAddress: '',
};

type Props = {
  mode: 'create' | 'edit';
  initial: ShopFormInitial;
  /** Cần khi `mode === 'create'` để body POST hợp lệ với DTO. */
  merchantId?: string;
};

export function ShopForm({ mode, initial, merchantId }: Props) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [phone, setPhone] = useState(initial.phone);
  const [status, setStatus] = useState<ShopStatus>(initial.status);
  const [pickupAddress, setPickupAddress] = useState(
    initial.pickupAddress ?? '',
  );
  const [returnAddress, setReturnAddress] = useState(
    initial.returnAddress ?? '',
  );

  // Image state: existing = URL từ server, newBase64 = preview ảnh user vừa
  // chọn chưa upload. Khi submit, nếu có newBase64 thì upload → URL mới; nếu
  // không thì giữ existing.
  const [logoExisting] = useState<string | null>(initial.logo);
  const [logoNewBase64, setLogoNewBase64] = useState<string | null>(null);
  const [bannerExisting] = useState<string | null>(initial.banner);
  const [bannerNewBase64, setBannerNewBase64] = useState<string | null>(null);

  // Sync khi initial thay đổi (vd: revalidatePath sau update).
  useEffect(() => {
    setName(initial.name);
    setDescription(initial.description);
    setPhone(initial.phone);
    setStatus(initial.status);
    setPickupAddress(initial.pickupAddress ?? '');
    setReturnAddress(initial.returnAddress ?? '');
    setLogoNewBase64(null);
    setBannerNewBase64(null);
  }, [initial]);

  const onPickImage = async (
    e: ChangeEvent<HTMLInputElement>,
    setter: (b64: string) => void,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép pick lại cùng file
    if (!file) return;

    if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh PNG hoặc JPG hoặc JPEG.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`Ảnh tối đa ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await fileToBase64DataUrl(file);
      setter(dataUrl);
    } catch {
      toast.error('Không thể đọc file ảnh. Vui lòng thử lại.');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Tên shop không được để trống.');
      return;
    }

    const basePayload = {
      name: trimmedName,
      description: description.trim(),
      phone: phone.trim() || null,
      status,
      pickupAddress: pickupAddress.trim() || null,
      returnAddress: returnAddress.trim() || null,
      logo: logoExisting,
      banner: bannerExisting,
    };

    const uploads = {
      logoBase64: logoNewBase64 ?? undefined,
      bannerBase64: bannerNewBase64 ?? undefined,
    };

    startTransition(async () => {
      if (mode === 'create') {
        if (!merchantId) {
          toast.error('Thiếu merchantId, không thể tạo shop.');
          return;
        }
        const res = await createShopAction(
          { ...basePayload, merchantId } as Parameters<
            typeof createShopAction
          >[0],
          uploads,
        );
        if (res.ok) {
          toast.success('Tạo shop thành công.');
        } else {
          toast.error(res.message ?? 'Tạo shop thất bại.');
        }
      } else {
        const res = await updateShopAction(basePayload, uploads);
        if (res.ok) {
          toast.success('Cập nhật shop thành công.');
        } else {
          toast.error(res.message ?? 'Cập nhật shop thất bại.');
        }
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Banner + logo */}
      <section className="card overflow-hidden">
        <BannerPicker
          existing={bannerExisting}
          newBase64={bannerNewBase64}
          onPick={(e) => onPickImage(e, setBannerNewBase64)}
          onRevert={() => setBannerNewBase64(null)}
        />

        <div className="px-5 md:px-6 pb-5 -mt-12 md:-mt-14 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <LogoPicker
            existing={logoExisting}
            newBase64={logoNewBase64}
            onPick={(e) => onPickImage(e, setLogoNewBase64)}
            onRevert={() => setLogoNewBase64(null)}
          />
          <div className="flex-1 min-w-0 sm:pb-1.5">
            <h2 className="text-lg font-semibold text-ink">
              {mode === 'create' ? 'Tạo shop mới' : 'Thông tin shop'}
            </h2>
            <p className="text-sm text-ink-muted mt-0.5">
              {mode === 'create'
                ? 'Nhập thông tin để khởi tạo shop của bạn.'
                : 'Chỉnh sửa thông tin trưng bày và vận hành của shop.'}
            </p>
          </div>
        </div>
      </section>

      {/* Trường text */}
      <section className="card p-5 md:p-6 space-y-4">
        <h3 className="text-base font-semibold text-ink">Thông tin chung</h3>

        <Field
          id="shop-name"
          label="Tên shop"
          required
          value={name}
          onChange={setName}
          maxLength={500}
          placeholder="Ví dụ: V-Shop Official"
        />

        <div>
          <label
            htmlFor="shop-description"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Mô tả shop
          </label>
          <textarea
            id="shop-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Giới thiệu ngắn về shop, ngành hàng, cam kết với khách…"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            id="shop-phone"
            label="Số điện thoại"
            value={phone}
            onChange={setPhone}
            maxLength={20}
            placeholder="090xxxxxxx"
            type="tel"
          />

          <div>
            <label
              htmlFor="shop-status"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Trạng thái
            </label>
            <select
              id="shop-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ShopStatus)}
              className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              {ShopStatusEnums.options.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field
          id="shop-pickup"
          label="Địa chỉ lấy hàng"
          value={pickupAddress}
          onChange={setPickupAddress}
          placeholder="Địa chỉ kho/lấy hàng cho đơn vị vận chuyển"
        />

        <Field
          id="shop-return"
          label="Địa chỉ trả hàng"
          value={returnAddress}
          onChange={setReturnAddress}
          placeholder="Địa chỉ nhận lại hàng hoàn"
        />
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 h-11 px-5 rounded bg-primary text-white font-semibold text-sm shadow-[0_4px_12px_rgba(255,107,53,0.25)] hover:bg-primary-600 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending
            ? mode === 'create'
              ? 'Đang tạo…'
              : 'Đang cập nhật…'
            : mode === 'create'
              ? 'Tạo shop'
              : 'Cập nhật'}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  maxLength,
  placeholder,
  type = 'text',
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  type?: 'text' | 'tel';
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
      />
    </div>
  );
}

function BannerPicker({
  existing,
  newBase64,
  onPick,
  onRevert,
}: {
  existing: string | null;
  newBase64: string | null;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onRevert: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = newBase64 ?? existing;

  return (
    <div className="relative h-40 md:h-52 bg-surface-muted">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Banner shop"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-ink-subtle gap-1.5">
          <ImagePlus className="w-7 h-7" />
          <span className="text-sm">Chưa có ảnh banner</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={onPick}
        className="hidden"
      />

      <div className="absolute top-3 right-3 flex items-center gap-2">
        {newBase64 && (
          <button
            type="button"
            onClick={onRevert}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded bg-white/90 backdrop-blur text-ink-muted text-xs font-medium border border-slate-200 hover:text-danger hover:border-red-200 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Hoàn tác banner
          </button>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded bg-white/90 backdrop-blur text-ink-muted text-xs font-medium border border-slate-200 hover:text-primary hover:border-primary hover:bg-primary-50/40 transition-colors duration-200 cursor-pointer"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          {preview ? 'Đổi banner' : 'Tải banner'}
        </button>
      </div>
    </div>
  );
}

function LogoPicker({
  existing,
  newBase64,
  onPick,
  onRevert,
}: {
  existing: string | null;
  newBase64: string | null;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onRevert: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = newBase64 ?? existing;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="block w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white bg-white shadow-card cursor-pointer hover:opacity-90 transition-opacity duration-200"
        aria-label={preview ? 'Đổi logo' : 'Tải logo'}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Logo shop"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary">
            <Store className="w-8 h-8" />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={onPick}
        className="hidden"
      />

      {newBase64 && (
        <button
          type="button"
          onClick={onRevert}
          aria-label="Hoàn tác logo"
          className="absolute -top-1 -right-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-ink-muted border border-slate-200 shadow-card hover:text-danger hover:border-red-200 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          title="Hoàn tác logo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
