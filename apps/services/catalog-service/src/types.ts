import {
  AttributesProduct as AttributesProductType,
  VariantsProduct as VariantsProductType,
} from '@common/schemas/product';

declare global {
  namespace PrismaJson {
    type Variants = VariantsProductType;
    type Attributes = AttributesProductType;
  }
}
