'use client';

import { Plus, TicketPercent, X } from 'lucide-react';
import { type ChangeEvent, useMemo, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createPromotionAction,
  deletePromotionAction,
  getPromotionByIdAction,
  updatePromotionAction,
} from './actions';

type PromotionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
type PromotionScope = 'ORDER' | 'SHIPPING';
type DiscountType = 'PERCENT' | 'AMOUNT';

type PromotionViewModel = {
  id: string;
  code: string;
  name: string;
  usedCount?: number;
  totalLimit?: number;
};

type PromotionFormState = {
  code: string;
  name: string;
  description: string;
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  scope: PromotionScope;
  discountType: DiscountType;
  minOrderSubtotal: string;
  discountValue: string;
  maxDiscount: string;
  totalLimit: string;
};

const STATUS_OPTIONS: { value: PromotionStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'ENDED', label: 'Đã kết thúc' },
];

const SCOPE_OPTIONS: { value: PromotionScope; label: string }[] = [
  { value: 'ORDER', label: 'Áp dụng đơn hàng' },
  { value: 'SHIPPING', label: 'Áp dụng vận chuyển' },
];

const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'PERCENT', label: 'Giảm theo %' },
  { value: 'AMOUNT', label: 'Giảm số tiền cố định' },
];

function parseNumber(value: string): number {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function toInputDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

function toIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function emptyForm(): PromotionFormState {
  return {
    code: '',
    name: '',
    description: '',
    status: 'DRAFT',
    startsAt: '',
    endsAt: '',
    scope: 'ORDER',
    discountType: 'PERCENT',
    minOrderSubtotal: '0',
    discountValue: '0',
    maxDiscount: '',
    totalLimit: '1',
  };
}

function formFromPromotion(data: {
  code: string;
  name: string;
  description?: string | null;
  status: string;
  startsAt?: string | null;
  endsAt?: string | null;
  scope: string;
  discountType: string;
  minOrderSubtotal?: number | null;
  discountValue?: number | null;
  maxDiscount?: number | null;
  totalLimit?: number | null;
}): PromotionFormState {
  return {
    code: data.code,
    name: data.name,
    description: data.description ?? '',
    status: (data.status as PromotionStatus) ?? 'DRAFT',
    startsAt: toInputDateTime(data.startsAt),
    endsAt: toInputDateTime(data.endsAt),
    scope: (data.scope as PromotionScope) ?? 'ORDER',
    discountType: (data.discountType as DiscountType) ?? 'PERCENT',
    minOrderSubtotal: String(data.minOrderSubtotal ?? 0),
    discountValue: String(data.discountValue ?? 0),
    maxDiscount:
      typeof data.maxDiscount === 'number' ? String(data.maxDiscount) : '',
    totalLimit: String(data.totalLimit ?? 0),
  };
}

function PromotionFormFields({
  form,
  setForm,
}: {
  form: PromotionFormState;
  setForm: (next: PromotionFormState) => void;
}) {
  const onChange =
    (key: keyof PromotionFormState) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm({ ...form, [key]: event.target.value });
    };

  const labelClass =
    'block text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Mã khuyến mãi</label>
          <input
            value={form.code}
            onChange={onChange('code')}
            className="input"
            placeholder="Nhập mã khuyến mãi"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Tên chương trình</label>
          <input
            value={form.name}
            onChange={onChange('name')}
            className="input"
            placeholder="Nhập tên chương trình"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Mô tả chương trình</label>
        <textarea
          value={form.description}
          onChange={onChange('description')}
          className="input min-h-24"
          placeholder="Nhập mô tả chương trình"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Trạng thái</label>
          <select
            value={form.status}
            onChange={onChange('status')}
            className="input cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Phạm vi áp dụng</label>
          <select
            value={form.scope}
            onChange={onChange('scope')}
            className="input cursor-pointer"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ngày bắt đầu</label>
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={onChange('startsAt')}
            className="input"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Ngày kết thúc</label>
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={onChange('endsAt')}
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Loại giảm giá</label>
          <select
            value={form.discountType}
            onChange={onChange('discountType')}
            className="input cursor-pointer"
          >
            {DISCOUNT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Giá trị giảm</label>
          <input
            type="number"
            min={0}
            value={form.discountValue}
            onChange={onChange('discountValue')}
            className="input"
            placeholder="Nhập giá trị giảm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Đơn tối thiểu</label>
          <input
            type="number"
            min={0}
            value={form.minOrderSubtotal}
            onChange={onChange('minOrderSubtotal')}
            className="input"
            placeholder="Nhập đơn tối thiểu"
          />
        </div>
        <div>
          <label className={labelClass}>Giảm tối đa</label>
          <input
            type="number"
            min={0}
            value={form.maxDiscount}
            onChange={onChange('maxDiscount')}
            className="input"
            placeholder="Nhập mức giảm tối đa"
          />
        </div>
        <div>
          <label className={labelClass}>Giới hạn lượt dùng</label>
          <input
            type="number"
            min={1}
            value={form.totalLimit}
            onChange={onChange('totalLimit')}
            className="input"
            placeholder="Nhập giới hạn lượt dùng"
            required
          />
        </div>
      </div>
    </div>
  );
}

function PromotionCreateModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<PromotionFormState>(emptyForm());

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary btn-md"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Tạo promotion
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3">
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
                startTransition(async () => {
                  const startsAt = toIso(form.startsAt);
                  const endsAt = toIso(form.endsAt);
                  if (!startsAt || !endsAt) {
                    toast.error('Ngày bắt đầu/kết thúc không hợp lệ.');
                    return;
                  }

                  const res = await createPromotionAction({
                    code: form.code.trim(),
                    name: form.name.trim(),
                    description: form.description.trim(),
                    status: form.status,
                    startsAt,
                    endsAt,
                    scope: form.scope,
                    minOrderSubtotal: parseNumber(form.minOrderSubtotal),
                    discountType: form.discountType,
                    discountValue: parseNumber(form.discountValue),
                    maxDiscount: form.maxDiscount
                      ? parseNumber(form.maxDiscount)
                      : undefined,
                    totalLimit: parseNumber(form.totalLimit),
                  });

                  if (res.ok) {
                    toast.success('Tạo promotion thành công.');
                    setForm(emptyForm());
                    setOpen(false);
                  } else {
                    toast.error(res.message || 'Tạo promotion thất bại.');
                  }
                });
              }}
            >
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-ink">
                  Tạo chương trình khuyến mãi
                </h2>
                <PromotionFormFields form={form} setForm={setForm} />
              </section>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-outline btn-md"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-md"
                  disabled={isPending}
                >
                  {isPending ? 'Đang tạo...' : 'Tạo promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function PromotionDialogCard({
  promotion,
}: {
  promotion: PromotionViewModel;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<PromotionFormState>(emptyForm());
  const [detailId, setDetailId] = useState<string | null>(null);

  const openDialog = () => {
    setOpen(true);
    startTransition(async () => {
      const res = await getPromotionByIdAction(promotion.id);
      if (!res.ok || !res.data) {
        toast.error(res.message || 'Không tải được thông tin promotion.');
        return;
      }

      setDetailId(res.data.id);
      setForm(
        formFromPromotion({
          code: res.data.code,
          name: res.data.name,
          description: res.data.description,
          status: res.data.status,
          startsAt: res.data.startsAt,
          endsAt: res.data.endsAt,
          scope: res.data.scope,
          discountType: res.data.discountType,
          minOrderSubtotal: res.data.minOrderSubtotal,
          discountValue: res.data.discountValue,
          maxDiscount: res.data.maxDiscount,
          totalLimit: res.data.totalLimit,
        }),
      );
    });
  };

  const usage = useMemo(() => {
    const used = promotion.usedCount ?? 0;
    const total = promotion.totalLimit ?? 0;
    return `${used}/${total || '∞'}`;
  }, [promotion.totalLimit, promotion.usedCount]);

  return (
    <>
      <button
        type="button"
        className="card p-4 hover:bg-primary-50/40 border border-slate-200 transition-colors duration-200 cursor-pointer text-left w-full"
        onClick={openDialog}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0">
            <TicketPercent className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              {promotion.code}
            </p>
            <p className="text-xs text-ink-muted truncate">
              {promotion.name} · {usage}
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-3">
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
                if (!detailId) return;

                startTransition(async () => {
                  const startsAt = toIso(form.startsAt);
                  const endsAt = toIso(form.endsAt);
                  if (!startsAt || !endsAt) {
                    toast.error('Ngày bắt đầu/kết thúc không hợp lệ.');
                    return;
                  }

                  const res = await updatePromotionAction({
                    id: detailId,
                    code: form.code.trim(),
                    name: form.name.trim(),
                    description: form.description.trim(),
                    status: form.status,
                    startsAt,
                    endsAt,
                    scope: form.scope,
                    discountType: form.discountType,
                    minOrderSubtotal: parseNumber(form.minOrderSubtotal),
                    discountValue: parseNumber(form.discountValue),
                    maxDiscount: form.maxDiscount
                      ? parseNumber(form.maxDiscount)
                      : undefined,
                    totalLimit: parseNumber(form.totalLimit),
                  });

                  if (res.ok) {
                    toast.success('Cập nhật promotion thành công.');
                    setOpen(false);
                  } else {
                    toast.error(res.message || 'Cập nhật promotion thất bại.');
                  }
                });
              }}
            >
              <section className="space-y-3">
                <h2 className="text-base font-semibold text-ink">
                  Thông tin chương trình khuyến mãi
                </h2>
                <PromotionFormFields form={form} setForm={setForm} />
              </section>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="submit"
                  className="btn-primary btn-md"
                  disabled={isPending || !detailId}
                >
                  {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  className="btn-outline btn-md"
                  disabled={isPending || !detailId}
                  onClick={() => {
                    if (!detailId) return;
                    if (!confirm('Bạn chắc chắn muốn xoá promotion này?'))
                      return;
                    startTransition(async () => {
                      const deleteRes = await deletePromotionAction(detailId);
                      if (deleteRes.ok) {
                        toast.success('Xóa promotion thành công.');
                        setOpen(false);
                      } else {
                        toast.error(
                          deleteRes.message || 'Xóa promotion thất bại.',
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

export function PromotionCardGrid({
  promotions,
}: {
  promotions: PromotionViewModel[];
}) {
  if (promotions.length === 0) {
    return (
      <div className="card p-10 text-center text-ink-muted">
        Không có chương trình khuyến mãi.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {promotions.map((promotion) => (
        <PromotionDialogCard key={promotion.id} promotion={promotion} />
      ))}
    </div>
  );
}

export function PromotionToolbar() {
  return <PromotionCreateModal />;
}
