import z from 'zod';

export const BaseSchema = z.object({
  id: z.uuid(),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  deletedById: z.string().nullable(),
  deletedAt: z.any().nullable(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
