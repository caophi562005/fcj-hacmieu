'use client';

import { Clock, Film, Loader2, Pencil, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';

export type VideoData = {
  id: string;
  shopId: string;
  productId?: string | null;
  status: string;
  isHidden?: boolean;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  hlsUrl?: string;
  thumbnailUrl?: string;
};

export type VideoCardAction = {
  ok: boolean;
  message?: string;
};

export type VideoCardProps = {
  video: VideoData;
  onDelete?: (id: string) => Promise<VideoCardAction>;
  onUpdate?: (
    id: string,
    payload: { productId?: string | null; isHidden?: boolean },
  ) => Promise<VideoCardAction>;
  toast?: {
    success: (msg: string) => void;
    error: (msg: string) => void;
  };
  /** If provided, clicking card navigates to this URL instead of opening inline player */
  href?: string;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  READY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ upload',
  PROCESSING: 'Đang xử lý',
  READY: 'Sẵn sàng',
  FAILED: 'Lỗi',
};

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoCard({
  video,
  onDelete,
  onUpdate,
  toast,
  href,
}: VideoCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Bạn có chắc muốn xoá video này?')) return;
    if (!onDelete) return;
    setDeleting(true);
    const result = await onDelete(video.id);
    if (result.ok) {
      toast?.success('Đã xoá video.');
    } else {
      toast?.error(result.message || 'Xoá video thất bại.');
    }
    setDeleting(false);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setShowEditModal(true);
  }

  function handleCardClick() {
    if (!href && video.status === 'READY' && video.hlsUrl) {
      setShowPlayer(true);
    }
  }

  const isClickable = video.status === 'READY' && (href || video.hlsUrl);

  const cardContent = (
    <>
      {/* Thumbnail */}
      <div className="aspect-[9/16] bg-slate-100 relative flex items-center justify-center">
        {video.status === 'READY' && video.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={video.thumbnailUrl}
            alt={`Video ${video.id.slice(0, 8)}`}
            className="w-full h-full object-cover"
          />
        ) : video.status === 'PROCESSING' ? (
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        ) : video.status === 'FAILED' ? (
          <XCircle className="w-8 h-8 text-red-400" />
        ) : (
          <Film className="w-8 h-8 text-slate-300" />
        )}

        {video.isHidden && (
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
            ẨN
          </span>
        )}

        {video.status === 'READY' && video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[video.status] || ''}`}
          >
            {STATUS_LABEL[video.status] || video.status}
          </span>

          <div className="flex items-center gap-1">
            {onUpdate && (
              <button
                type="button"
                onClick={handleEdit}
                className="p-1.5 rounded text-ink-muted hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                aria-label="Chỉnh sửa video"
                title="Chỉnh sửa"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 rounded text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Xoá video"
                title="Xoá video"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {video.width && video.height && (
          <p className="text-xs text-ink-muted">
            {video.width}×{video.height}
          </p>
        )}

        <p className="text-xs text-ink-subtle truncate" title={video.id}>
          ID: {video.id.slice(0, 8)}…
        </p>
      </div>
    </>
  );

  return (
    <>
      {href ? (
        <Link
          href={href}
          className={`card overflow-hidden group block ${isClickable ? 'cursor-pointer' : ''}`}
        >
          {cardContent}
        </Link>
      ) : (
        <div
          className={`card overflow-hidden group ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={handleCardClick}
        >
          {cardContent}
        </div>
      )}

      {/* Inline Video Player (when no href) */}
      {showPlayer && video.hlsUrl && (
        <VideoPlayer
          src={video.hlsUrl}
          poster={video.thumbnailUrl}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && onUpdate && (
        <VideoEditModal
          video={video}
          onClose={() => setShowEditModal(false)}
          onSave={onUpdate}
          toast={toast}
        />
      )}
    </>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function VideoEditModal({
  video,
  onClose,
  onSave,
  toast,
}: {
  video: VideoData;
  onClose: () => void;
  onSave: (
    id: string,
    payload: { productId?: string | null; isHidden?: boolean },
  ) => Promise<VideoCardAction>;
  toast?: { success: (msg: string) => void; error: (msg: string) => void };
}) {
  const [productId, setProductId] = useState(video.productId || '');
  const [isHidden, setIsHidden] = useState(video.isHidden ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await onSave(video.id, {
      productId: productId.trim() || null,
      isHidden,
    });
    if (result.ok) {
      toast?.success('Đã cập nhật video.');
      onClose();
    } else {
      toast?.error(result.message || 'Cập nhật thất bại.');
    }
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Chỉnh sửa video"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-ink">Chỉnh sửa Video</h2>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-product-id"
            className="text-sm font-medium text-ink"
          >
            Product ID (tuỳ chọn)
          </label>
          <input
            id="edit-product-id"
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Nhập Product ID để gắn video vào sản phẩm"
            className="input w-full"
          />
          <p className="text-xs text-ink-muted">
            Gắn video vào sản phẩm cụ thể. Để trống nếu là video chung của shop.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
          />
          <span className="text-sm text-ink">Ẩn video</span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-md text-ink-muted hover:bg-surface-muted rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary btn-md cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
