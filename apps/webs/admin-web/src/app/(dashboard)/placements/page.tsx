import { formatCurrency, formatDateTime } from '@common/web-core/lib/format';
import { Pagination } from '@common/web-ui/index';
import { Megaphone, Store, Tags } from 'lucide-react';
import {
  getAdminPlacementConfig,
  getAdminProductPlacements,
} from '../../../lib/admin-product-placement';
import { CancelPlacementButton } from './ui';

type SearchParams = { page?: string; shopId?: string; status?: string };
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Đã hết hạn',
  CANCELLED: 'Đã hủy',
};

function pageNumber(raw?: string) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function href(sp: SearchParams, page: number) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (sp.shopId) params.set('shopId', sp.shopId);
  if (sp.status) params.set('status', sp.status);
  const query = params.toString();
  return query ? `/placements?${query}` : '/placements';
}

export const metadata = { title: 'Quản lý quảng bá — V-Shop Admin' };

export default async function ProductPlacementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = pageNumber(sp.page);
  const [config, data] = await Promise.all([
    getAdminPlacementConfig(),
    getAdminProductPlacements({
      page,
      limit: 20,
      shopId: sp.shopId,
      status: sp.status,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">
          Quản lý quảng bá sản phẩm
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Theo dõi tối đa {config?.maxActiveSlots ?? 20} vị trí nổi bật và dừng
          thủ công khi cần kiểm tra. Hủy vị trí không hoàn phí.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <Megaphone className="h-5 w-5 text-primary" />
          <div className="mt-3 text-sm text-ink-muted">Đang sử dụng</div>
          <div className="text-2xl font-bold">{config?.occupiedSlots ?? 0}</div>
        </div>
        <div className="card p-5">
          <Store className="h-5 w-5 text-primary" />
          <div className="mt-3 text-sm text-ink-muted">Còn trống</div>
          <div className="text-2xl font-bold">
            {config?.availableSlots ?? 0}
          </div>
        </div>
        <div className="card p-5">
          <Tags className="h-5 w-5 text-primary" />
          <div className="mt-3 text-sm text-ink-muted">Giá mỗi ngày</div>
          <div className="text-2xl font-bold">
            {formatCurrency(config?.pricePerDay ?? 0)}
          </div>
        </div>
      </div>

      <form
        action="/placements"
        className="card grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]"
      >
        <input
          name="shopId"
          defaultValue={sp.shopId}
          placeholder="Tìm theo Shop ID"
          className="input"
        />
        <select name="status" defaultValue={sp.status ?? ''} className="input">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <button className="btn-primary btn-md" type="submit">
          Lọc
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left">
            <tr>
              <th className="p-4">Shop / Sản phẩm</th>
              <th className="p-4">Vị trí</th>
              <th className="p-4">Phí</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.placements.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">
                  <div className="font-medium">Shop: {item.shopId}</div>
                  <div className="mt-1 text-xs text-ink-muted">
                    Product: {item.productId}
                  </div>
                </td>
                <td className="p-4">#{item.position}</td>
                <td className="p-4">{formatCurrency(item.amount)}</td>
                <td className="p-4">
                  <div>{formatDateTime(item.startsAt)}</div>
                  <div className="text-xs text-ink-muted">
                    đến {formatDateTime(item.endsAt)}
                  </div>
                </td>
                <td className="p-4">
                  {STATUS_LABEL[item.status] ?? item.status}
                </td>
                <td className="p-4">
                  {item.status === 'ACTIVE' ? (
                    <CancelPlacementButton id={item.id} />
                  ) : (
                    <span className="text-xs text-ink-muted">
                      Không thể thay đổi
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!data.placements.length && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-ink-muted">
                  Không tìm thấy vị trí quảng bá.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          buildHref={(nextPage) => href(sp, nextPage)}
        />
      )}
    </div>
  );
}
