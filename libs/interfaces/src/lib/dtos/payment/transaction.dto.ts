import {
  WebhookTransactionRequestSchema,
  WebhookTransactionResponseSchema,
} from '@common/interfaces/models/payment/transaction';
import { createZodDto } from 'nestjs-zod';

export class WebhookTransactionRequestDto extends createZodDto(
  WebhookTransactionRequestSchema
) {}

export class WebhookTransactionResponseDto extends createZodDto(
  WebhookTransactionResponseSchema
) {}
