'use client';

import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { updateSettlementAction } from './actions';

export function SettlementActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  const run = (action: 'HOLD' | 'RELEASE' | 'CANCEL') => {
    let reason: string | undefined;
    if (action === 'HOLD' || action === 'CANCEL') {
      reason = window
        .prompt(
          action === 'HOLD'
            ? 'Nhập lý do tạm khóa giải ngân:'
            : 'Nhập lý do hủy khoản giải ngân:',
        )
        ?.trim();
      if (!reason) return;
    }
    startTransition(async () => {
      const result = await updateSettlementAction({
        settlementId: id,
        action,
        reason,
      });
      if (result.ok) toast.success('Cập nhật trạng thái giải ngân thành công.');
      else toast.error(result.message);
    });
  };

  if (status === 'SETTLED' || status === 'CANCELLED')
    return <span className="text-xs text-ink-muted">Không thể thay đổi</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {status === 'HELD' ? (
        <button
          disabled={pending}
          type="button"
          className="btn-primary btn-sm"
          onClick={() => run('RELEASE')}
        >
          Mở khóa
        </button>
      ) : (
        <button
          disabled={pending}
          type="button"
          className="btn-outline btn-sm"
          onClick={() => run('HOLD')}
        >
          Khóa
        </button>
      )}
      <button
        disabled={pending}
        type="button"
        className="btn-outline btn-sm text-danger"
        onClick={() => run('CANCEL')}
      >
        Hủy
      </button>
    </div>
  );
}
