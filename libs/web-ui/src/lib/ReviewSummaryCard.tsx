import type { ReviewSummaryResponse } from '@common/interfaces/models/ai';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';

type Props = {
  summary: ReviewSummaryResponse;
};

export function ReviewSummaryCard({ summary }: Props) {
  const hasPros = summary.pros.length > 0;
  const hasCons = summary.cons.length > 0;

  if (!hasPros && !hasCons) return null;

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" aria-hidden />
        <h3 className="font-semibold">Tóm tắt đánh giá từ AI</h3>
        <span className="text-xs text-ink-subtle ml-auto">
          Dựa trên {summary.reviewCount} đánh giá
        </span>
      </div>

      {summary.summary && (
        <p className="text-sm text-ink-muted mb-4">{summary.summary}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {hasPros && (
          <div>
            <h4 className="text-sm font-medium text-success mb-2">Ưu điểm</h4>
            <ul className="space-y-1.5">
              {summary.pros.map((pro, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasCons && (
          <div>
            <h4 className="text-sm font-medium text-danger mb-2">Nhược điểm</h4>
            <ul className="space-y-1.5">
              {summary.cons.map((con, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
