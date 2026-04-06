import {
  Receiver as ReceiverType,
  Timeline as TimelineType,
} from '@common/schemas/order';

declare global {
  namespace PrismaJson {
    type Receiver = ReceiverType;
    type Timeline = TimelineType;
  }
}
