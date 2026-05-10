import { getManyBrands } from '../../lib/admin-catalog';
import { BrandCreateForm, BrandGrid } from './ui';

export default async function BrandsPage() {
  const data = await getManyBrands({ page: 1, limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý thương hiệu</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} thương hiệu.
        </p>
      </div>

      <BrandCreateForm />

      <BrandGrid
        brands={data.brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          logo: brand.logo,
        }))}
      />
    </div>
  );
}
