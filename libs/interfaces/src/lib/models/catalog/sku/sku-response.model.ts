import { SKUSchema } from '@common/schemas/catalog';
import z from 'zod';

export const SKUResponseSchema = SKUSchema;

export type SKUResponse = z.infer<typeof SKUResponseSchema>;
