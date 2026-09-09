'use client';

import {
  EMPTY_PRODUCT,
  ProductForm as SharedProductForm,
  type ProductFormInitial,
  type ProductFormProps,
  type ProductImageUploadInput,
  type SkuImageUploadInput,
} from '@common/web-ui/lib/ProductForm';
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from '../../../lib/catalog';
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from '../actions';
import { loadChildCategories, loadDistricts, loadWards } from '../lookups';

export { EMPTY_PRODUCT };
export type { ProductFormInitial };

type Props = Omit<ProductFormProps, 'adminMode' | 'actions' | 'lookups'>;

const sellerActions = {
  createProduct: (
    payload: unknown,
    images?: ProductImageUploadInput,
    skuImages?: SkuImageUploadInput[],
  ) => createProductAction(payload as CreateProductPayload, images, skuImages),
  updateProduct: (
    id: string,
    payload: unknown,
    images?: ProductImageUploadInput,
    skuImages?: SkuImageUploadInput[],
  ) =>
    updateProductAction(id, payload as UpdateProductPayload, images, skuImages),
  deleteProduct: deleteProductAction,
};

const sellerLookups = { loadChildCategories, loadDistricts, loadWards };

export function ProductForm(props: Props) {
  return (
    <SharedProductForm
      {...props}
      actions={sellerActions}
      lookups={sellerLookups}
    />
  );
}
