'use client';

import { Save, Store } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { createMerchantAction } from '../actions';

export function MerchantForm() {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [legalName, setLegalName] = useState('');
  const [taxCode, setTaxCode] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = legalName.trim();
    if (!trimmedName) {
      toast.error('Tên pháp lý không được để trống.');
      return;
    }

    startTransition(async () => {
      const res = await createMerchantAction({
        type,
        legalName: trimmedName,
        taxCode: taxCode.trim() || null,
      });

      if (res.ok) {
        toast.success('Đăng ký Merchant thành công.');
      } else {
        toast.error(res.message ?? 'Đăng ký thất bại.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Đăng ký Merchant</h2>
        <p className="text-ink-muted text-sm mt-1">
          Hoàn tất thông tin dưới đây để đăng ký trở thành đối tác bán hàng trên V-Shop.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card p-5 md:p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-3">
            Loại hình kinh doanh <span className="text-danger ml-0.5">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="merchant-type"
                value="INDIVIDUAL"
                checked={type === 'INDIVIDUAL'}
                onChange={() => setType('INDIVIDUAL')}
                className="w-4 h-4 text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-ink">Cá nhân</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="merchant-type"
                value="BUSINESS"
                checked={type === 'BUSINESS'}
                onChange={() => setType('BUSINESS')}
                className="w-4 h-4 text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-ink">Doanh nghiệp</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="legal-name" className="block text-sm font-medium text-ink mb-1.5">
            Tên pháp lý <span className="text-danger ml-0.5">*</span>
          </label>
          <input
            id="legal-name"
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            maxLength={500}
            placeholder={
              type === 'INDIVIDUAL'
                ? 'Họ và tên thật của bạn'
                : 'Tên công ty / doanh nghiệp đăng ký'
            }
            className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <p className="text-xs text-ink-subtle mt-1.5">
            Tên này phải khớp với thông tin trên giấy tờ tùy thân hoặc giấy phép kinh doanh.
          </p>
        </div>

        <div>
          <label htmlFor="tax-code" className="block text-sm font-medium text-ink mb-1.5">
            Mã số thuế {type === 'BUSINESS' && <span className="text-danger ml-0.5">*</span>}
          </label>
          <input
            id="tax-code"
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            maxLength={100}
            placeholder="Mã số thuế cá nhân / doanh nghiệp"
            className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>

        <div className="pt-2 border-t border-border-subtle flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-10 px-5 rounded bg-primary text-white font-semibold text-sm shadow hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Đang gửi...' : 'Đăng ký ngay'}
          </button>
        </div>
      </form>
    </div>
  );
}
