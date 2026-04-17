import { TusdWebhookTypeEnums } from '@common/constants/media.constant';
import z from 'zod';

export const TusdWebhookRequestSchema = z.object({
  Type: TusdWebhookTypeEnums,
  Event: z.object({
    Upload: z.object({
      ID: z.string(),
      Size: z.number(),
      SizeIsDeferred: z.boolean(),
      Offset: z.number(),
      MetaData: z.object({
        filename: z.string(),
        filetype: z.string(),
        productId: z.string(),
      }),
      IsPartial: z.boolean(),
      IsFinal: z.boolean(),
      PartialUploads: z.array(z.string()).nullable(),
      Storage: z
        .object({
          Bucket: z.string(),
          Key: z.string(),
          Type: z.string(),
        })
        .nullable(),
    }),
    HTTPRequest: z.object({
      Method: z.string(),
      URI: z.string(),
      RemoteAddr: z.string(),
      Header: z.record(z.string(), z.array(z.string())),
    }),
  }),
});

export type TusdWebhookRequest = z.infer<typeof TusdWebhookRequestSchema>;
