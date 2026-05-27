import { getCategoriesByParent, getManyBrands } from '../../../../lib/catalog';
import { getProvinces } from '../../../../lib/location';
import { EMPTY_PRODUCT, ProductForm } from '../_components/ProductForm';

export const metadata = { title: 'Tạo sản phẩm — V-Shop Admin' };

export default async function NewProductPage() {
  const [brands, rootCategories, provinces] = await Promise.all([
    getManyBrands(),
    getCategoriesByParent(),
    getProvinces(),
  ]);

  return (
    <ProductForm
      mode="create"
      initial={EMPTY_PRODUCT}
      brands={brands}
      rootCategories={rootCategories}
      provinces={provinces}
    />
  );
}
