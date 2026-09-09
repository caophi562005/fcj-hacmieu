'use client';

import type { MarketingCampaignResponse } from '@common/interfaces/models/promotion';
import { MailPlus, Play, RefreshCw, X } from 'lucide-react';
import { FormEvent, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import {
  createMarketingCampaignAction,
  dispatchMarketingCampaignAction,
  scanMarketingAction,
} from './actions';

type PromotionOption = { id: string; code: string; name: string };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  SCHEDULED: 'Đã lên lịch',
  PROCESSING: 'Đang gửi',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  FAILED: 'Thất bại',
};

export function MarketingToolbar({
  promotions,
}: {
  promotions: PromotionOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scheduled = String(form.get('scheduledAt') || '');
    startTransition(async () => {
      const result = await createMarketingCampaignAction({
        name: String(form.get('name') || '').trim(),
        promotionId: String(form.get('promotionId') || ''),
        subject: String(form.get('subject') || '').trim(),
        preheader: String(form.get('preheader') || '').trim() || undefined,
        introContent: String(form.get('introContent') || '').trim(),
        scheduledAt: scheduled ? new Date(scheduled).toISOString() : undefined,
      });
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else toast.error(result.message);
    });
  };

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn-outline btn-md"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await scanMarketingAction();
              if (result.ok) toast.success(result.message);
              else toast.error(result.message);
            })
          }
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Quét lịch ngay
        </button>
        <button
          type="button"
          className="btn-primary btn-md"
          onClick={() => setOpen(true)}
        >
          <MailPlus className="w-4 h-4 mr-1" /> Tạo chiến dịch
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
          <form
            onSubmit={submit}
            className="card p-6 w-full max-w-2xl space-y-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Email giới thiệu ưu đãi
                </h2>
                <p className="text-sm text-ink-muted">
                  Chỉ gửi cho khách đã đồng ý nhận ưu đãi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Field name="name" label="Tên chiến dịch" required />
            <label className="block text-sm font-medium">
              Voucher
              <select name="promotionId" className="input mt-1" required>
                <option value="">Chọn voucher đang hoạt động</option>
                {promotions.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    {promotion.code} — {promotion.name}
                  </option>
                ))}
              </select>
            </label>
            <Field name="subject" label="Tiêu đề email" required />
            <Field name="preheader" label="Nội dung xem trước" />
            <label className="block text-sm font-medium">
              Lời giới thiệu
              <textarea
                name="introContent"
                className="input mt-1 min-h-28"
                maxLength={2000}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Thời gian gửi (để trống để lưu nháp)
              <input
                name="scheduledAt"
                type="datetime-local"
                className="input mt-1"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-outline btn-md"
                onClick={() => setOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-primary btn-md"
                disabled={pending || !promotions.length}
              >
                {pending ? 'Đang tạo...' : 'Tạo chiến dịch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Field(props: { name: string; label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <input
        name={props.name}
        className="input mt-1"
        required={props.required}
        maxLength={250}
      />
    </label>
  );
}

export function MarketingCampaignGrid({
  campaigns,
}: {
  campaigns?: MarketingCampaignResponse[];
}) {
  if (!campaigns?.length) {
    return (
      <div className="card p-8 text-center text-ink-muted">
        Chưa có chiến dịch email.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: MarketingCampaignResponse }) {
  const [pending, startTransition] = useTransition();
  const canSend = ['DRAFT', 'SCHEDULED', 'FAILED'].includes(campaign.status);
  const rate = campaign.sentCount
    ? Math.round((campaign.clickedCount / campaign.sentCount) * 1000) / 10
    : 0;
  return (
    <article className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">{campaign.name}</h2>
          <p className="text-sm text-ink-muted">
            {campaign.promotionCode} · {campaign.promotionName}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-surface-muted font-medium">
          {STATUS_LABEL[campaign.status] || campaign.status}
        </span>
      </div>
      <p className="text-sm">
        <span className="text-ink-muted">Tiêu đề:</span> {campaign.subject}
      </p>
      <div className="grid grid-cols-4 gap-2 text-center">
        <Metric label="Người nhận" value={campaign.recipientCount} />
        <Metric label="Đã gửi" value={campaign.sentCount} />
        <Metric label="Đã mở" value={campaign.openedCount} />
        <Metric label="CTR" value={`${rate}%`} />
      </div>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>
          {campaign.scheduledAt
            ? `Lịch: ${formatDate(campaign.scheduledAt)}`
            : 'Chưa lên lịch'}
        </span>
        {canSend && (
          <button
            type="button"
            className="btn-primary btn-sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await dispatchMarketingCampaignAction(
                  campaign.id,
                );
                if (result.ok) toast.success(result.message);
                else toast.error(result.message);
              })
            }
          >
            <Play className="w-3.5 h-3.5 mr-1" />{' '}
            {pending ? 'Đang xử lý...' : 'Gửi ngay'}
          </button>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-surface-muted p-2">
      <div className="font-semibold">{value}</div>
      <div className="text-[11px] text-ink-muted">{label}</div>
    </div>
  );
}

function formatDate(value: unknown) {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
}
