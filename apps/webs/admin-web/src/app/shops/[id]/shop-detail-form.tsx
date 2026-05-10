'use client';

import { Building2, Store, Wallet } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateShopAction } from '../actions';

const SHOP_STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const;

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

  return (
    <form
      className="card p-6 md:p-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
          const res = await updateShopAction({
            id: shop.id,
            merchantId: String(formData.get('merchantId') || ''),
            name: String(formData.get('name') || ''),
            description: String(formData.get('description') || ''),
            status: String(formData.get('status') || ''),
            logo: String(formData.get('logo') || ''),
            banner: String(formData.get('banner') || ''),
            phone: String(formData.get('phone') || ''),
            pickupAddress: String(formData.get('pickupAddress') || ''),
            returnAddress: String(formData.get('returnAddress') || ''),
            bankName: String(formData.get('bankName') || ''),
            bankAccountNumber: String(formData.get('bankAccountNumber') || ''),
            bankCode: String(formData.get('bankCode') || ''),
            bankAccountName: String(formData.get('bankAccountName') || ''),
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

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Logo
            </p>
            {shop.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-ink-muted">
                No logo
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Banner
            </p>
            {shop.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.banner}
                alt={`${shop.name} banner`}
                className="w-full max-w-xs h-20 rounded-lg object-cover border border-slate-200 bg-white"
              />
            ) : (
              <div className="w-full max-w-xs h-20 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-ink-muted">
                No banner
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="merchantId"
            defaultValue={shop.merchantId}
            className="input"
            placeholder="Merchant ID"
            required
          />
          <input
            name="name"
            defaultValue={shop.name}
            className="input"
            required
          />
          <select
            name="status"
            defaultValue={shop.status}
            className="input cursor-pointer"
          >
            {SHOP_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
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
        <h2 className="text-base font-semibold text-ink flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Mô tả & địa chỉ
        </h2>
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
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="bankName"
            defaultValue={shop.bankName || ''}
            className="input"
            placeholder="Tên ngân hàng"
          />
          <input
            name="bankCode"
            defaultValue={shop.bankCode || ''}
            className="input"
            placeholder="Mã ngân hàng"
          />
          <input
            name="bankAccountName"
            defaultValue={shop.bankAccountName || ''}
            className="input"
            placeholder="Tên chủ tài khoản"
          />
          <input
            name="bankAccountNumber"
            defaultValue={shop.bankAccountNumber || ''}
            className="input"
            placeholder="Số tài khoản"
          />
        </div>
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
