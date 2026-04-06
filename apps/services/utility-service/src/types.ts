import { Metadata as MetadataType } from '@common/schemas/notification';

declare global {
  namespace PrismaJson {
    type Metadata = MetadataType;
  }
}
