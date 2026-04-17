import {
  AttributesProduct as AttributesProductType,
  VariantsProduct as VariantsProductType,
} from '@common/schemas/catalog';

declare global {
  namespace PrismaJson {
    type Variants = VariantsProductType;
    type Attributes = AttributesProductType;
  }
}
