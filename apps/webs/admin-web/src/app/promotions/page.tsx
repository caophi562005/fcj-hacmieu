import { PromotionStatusValues } from '@common/constants/promotion.constant';
import { Pagination } from '../../components/Pagination';
import { getManyPromotions } from '../../lib/admin-promotion';
import { PromotionCardGrid, PromotionToolbar } from './ui';

type SearchParams = {
  page?: string;
  code?: string;
  name?: string;
  status?: string;
};

const STATUS_LABEL: Record<string, string> = {
  [PromotionStatusValues.DRAFT]: 'Nháp',
  [PromotionStatusValues.ACTIVE]: 'Đang hoạt động',
  [PromotionStatusValues.PAUSED]: 'Tạm dừng',
  [PromotionStatusValues.ENDED]: 'Đã kết thúc',
};

function parsePage(raw?: string): number {
  const page = Number(raw);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function buildHref(query: {
  page?: number;
  code?: string;
  name?: string;
  status?: string;
}) {
  const sp = new URLSearchParams();
  if (query.code) sp.set('code', query.code);
  if (query.name) sp.set('name', query.name);
  if (query.status) sp.set('status', query.status);
  if (query.page && query.page > 1) sp.set('page', String(query.page));
  const qs = sp.toString();
  return qs ? `/promotions?${qs}` : '/promotions';
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = parsePage(sp.page);
  const code = (sp.code ?? '').trim();
  const name = (sp.name ?? '').trim();
  const status = (sp.status ?? '').trim();

  const data = await getManyPromotions({
    page,
    limit: 10,
    code: code || undefined,
    name: name || undefined,
    status: status || undefined,
  });
  const totalPages = Math.max(data.totalPages || 1, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý voucher</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} chương trình.
        </p>
      </div>

      <form
        action="/promotions"
        method="GET"
        className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <input
          name="code"
          defaultValue={code}
          placeholder="Code"
          className="input"
        />
        <input
          name="name"
          defaultValue={name}
          placeholder="Tên"
          className="input"
        />
        <select
          name="status"
          defaultValue={status}
          className="input cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.values(PromotionStatusValues).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary btn-md">
          Tìm kiếm
        </button>
      </form>

      <PromotionToolbar />

      <PromotionCardGrid
        promotions={data.promotions.map((promotion) => ({
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
          usedCount: promotion.usedCount,
          totalLimit: promotion.totalLimit,
        }))}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(n) => buildHref({ page: n, code, name, status })}
      />
    </div>
  );
}
