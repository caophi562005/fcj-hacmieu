import { SKUSchema } from '@common/schemas/product';
import z from 'zod';

export const SKUResponseSchema = SKUSchema;

export type SKUResponse = z.infer<typeof SKUResponseSchema>;
