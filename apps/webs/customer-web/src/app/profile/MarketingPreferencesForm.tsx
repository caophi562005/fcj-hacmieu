'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  updateMarketingPreferencesAction,
  type MarketingPreferencesState,
} from './marketing-actions';

const INITIAL_STATE: MarketingPreferencesState = { ok: false, message: '' };

export function MarketingPreferencesForm({
  promotionOffers,
  voucherReminders,
}: {
  promotionOffers: boolean;
  voucherReminders: boolean;
}) {
  const [state, action] = useActionState(
    updateMarketingPreferencesAction,
    INITIAL_STATE,
  );
  return (
    <form action={action} className="card p-4 sm:p-5 mt-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold">Email ưu đãi</h2>
        <p className="text-sm text-ink-muted mt-1">
          Bạn có thể thay đổi hoặc rút lại lựa chọn bất cứ lúc nào.
        </p>
      </div>
      <Preference
        name="promotionOffers"
        defaultChecked={promotionOffers}
        title="Giới thiệu chương trình ưu đãi"
        description="Nhận voucher và chương trình khuyến mãi mới từ V-Shop."
      />
      <Preference
        name="voucherReminders"
        defaultChecked={voucherReminders}
        title="Nhắc voucher sắp hết hạn"
        description="Nhận một email nhắc trước khi voucher đã lưu hết hạn."
      />
      {state.message && (
        <p
          className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`}
          role="status"
        >
          {state.message}
        </p>
      )}
      <PreferenceSubmit />
    </form>
  );
}

function Preference(props: {
  name: string;
  defaultChecked: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle cursor-pointer">
      <input
        type="checkbox"
        name={props.name}
        defaultChecked={props.defaultChecked}
        className="mt-1 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium">{props.title}</span>
        <span className="block text-xs text-ink-muted mt-1">
          {props.description}
        </span>
      </span>
    </label>
  );
}

function PreferenceSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-outline btn-md" disabled={pending}>
      {pending ? 'Đang lưu...' : 'Lưu lựa chọn email'}
    </button>
  );
}
