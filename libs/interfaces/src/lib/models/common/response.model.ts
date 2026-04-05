import z from 'zod';

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const ResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    statusCode: z.number().optional(),
    processId: z.string().optional(),
    duration: z.string().optional(),
  });

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type Response<T> = z.infer<
  ReturnType<typeof ResponseSchema<z.ZodType<T>>>
>;
