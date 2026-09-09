'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  createReportAction,
  ReportCategory,
  ReportTargetType,
} from '../lib/report.actions';

export type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
};

const TARGET_TYPE_MAP: Record<ReportTargetType, string> = {
  PRODUCT: 'sản phẩm',
  SELLER: 'cửa hàng',
  REVIEW: 'đánh giá',
  ORDER: 'đơn hàng',
  USER: 'người dùng',
  MESSAGE: 'tin nhắn',
};

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'SPAM', label: 'Spam / Quảng cáo rác' },
  { value: 'FAKE', label: 'Hàng giả / Hàng nhái' },
  { value: 'SCAM', label: 'Lừa đảo / Chiếm đoạt tài sản' },
  { value: 'FRAUD', label: 'Gian lận' },
  { value: 'HARASSMENT', label: 'Quấy rối / Chửi bới' },
  { value: 'OTHER', label: 'Lý do khác' },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const targetName = TARGET_TYPE_MAP[targetType] || 'đối tượng này';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.warn('Vui lòng chọn lý do báo cáo');
      return;
    }
    if (description.trim().length < 10) {
      toast.warn('Vui lòng nhập mô tả chi tiết (ít nhất 10 ký tự)');
      return;
    }

    startTransition(async () => {
      const selectedCategoryLabel =
        CATEGORIES.find((c) => c.value === category)?.label || 'Lý do khác';
      const generatedTitle = `Báo cáo ${targetName}: ${selectedCategoryLabel}`;

      const result = await createReportAction({
        targetType,
        targetId,
        category,
        title: generatedTitle,
        description: description.trim(),
      });

      if (result.ok) {
        toast.success(`Đã gửi báo cáo ${targetName} thành công. Cảm ơn bạn!`);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-lg w-full min-w-0 max-w-md shadow-xl overflow-hidden flex flex-col max-h-[min(80dvh,640px)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 p-4 border-b border-border">
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            Báo cáo {targetName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng báo cáo"
            className="shrink-0 text-ink-muted hover:text-ink p-1 rounded-full hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 p-4 overflow-y-auto overscroll-contain">
          <p className="text-sm text-ink-subtle mb-4">
            Vui lòng chọn lý do bạn muốn báo cáo {targetName}. Thông tin của bạn
            sẽ được giữ bí mật.
          </p>

          <form id="report-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">
                Lý do báo cáo <span className="text-danger">*</span>
              </label>
              <div className="grid gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex items-start gap-3 p-3 border border-border rounded cursor-pointer hover:bg-surface-muted transition-colors"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={() => setCategory(cat.value)}
                      className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-border"
                    />
                    <span className="text-sm text-ink">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">
                Mô tả chi tiết <span className="text-danger">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vui lòng cung cấp thêm chi tiết (ít nhất 10 ký tự)..."
                className="w-full p-3 border border-border rounded text-sm min-h-[100px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                disabled={isPending}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-border flex flex-wrap justify-end gap-3 bg-surface-muted/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-outline px-4 py-2"
          >
            Huỷ
          </button>
          <button
            type="submit"
            form="report-form"
            disabled={isPending}
            className="btn-primary px-4 py-2 disabled:opacity-60"
          >
            {isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
