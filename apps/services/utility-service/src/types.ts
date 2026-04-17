import { Metadata as MetadataType } from '@common/schemas/utility';

declare global {
  namespace PrismaJson {
    type Metadata = MetadataType;
  }
}
