import { Megaphone } from 'lucide-react';
import { getSellerProducts } from '../../../lib/catalog';
import {
  getMyPlacements,
  getPlacementConfig,
} from '../../../lib/product-placement';
import { PurchasePlacementForm } from './PurchasePlacementForm';

const money = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
const date = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));

export const metadata = { title: 'Quảng bá sản phẩm — V-Shop Seller' };

export default async function ProductPlacementsPage() {
  const [config, placements, products] = await Promise.all([
    getPlacementConfig(),
    getMyPlacements(),
    getSellerProducts({ page: 1, limit: 100, status: 'ACTIVE' }),
  ]);
  const active = placements.placements.find(
    (item) => item.status === 'ACTIVE' && new Date(item.endsAt) > new Date(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quảng bá sản phẩm</h1>
        <p className="mt-1 text-muted">
          Mua một trong tối đa {config?.maxActiveSlots ?? 20} vị trí nổi bật
          trên trang chủ.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-muted">Vị trí còn trống</div>
          <div className="mt-2 text-2xl font-bold">
            {config?.availableSlots ?? 0}/{config?.maxActiveSlots ?? 20}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted">Đơn giá mỗi ngày</div>
          <div className="mt-2 text-2xl font-bold">
            {money(config?.pricePerDay ?? 0)}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted">Giới hạn</div>
          <div className="mt-2 font-semibold">
            Mỗi shop 1 vị trí đang hoạt động
          </div>
        </div>
      </div>
      {active ? (
        <div className="card p-6">
          <div className="flex items-center gap-2 font-semibold">
            <Megaphone className="h-5 w-5 text-primary" />
            Vị trí đang hoạt động #{active.position}
          </div>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
            <span>Sản phẩm: {active.productId}</span>
            <span>Phí: {money(active.amount)}</span>
            <span>Hết hạn: {date(active.endsAt)}</span>
          </div>
        </div>
      ) : (
        <PurchasePlacementForm
          products={products.products.map(({ id, name }) => ({ id, name }))}
          allowedDurations={config?.allowedDurations ?? [1, 3, 7]}
          disabled={!config?.availableSlots || !products.products.length}
        />
      )}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left">
            <tr>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Vị trí</th>
              <th className="p-4">Phí</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {placements.placements.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4">{item.productId}</td>
                <td className="p-4">#{item.position}</td>
                <td className="p-4">{money(item.amount)}</td>
                <td className="p-4">
                  {date(item.startsAt)} – {date(item.endsAt)}
                </td>
                <td className="p-4">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
