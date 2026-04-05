import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export class MessageResponseDto extends createZodDto(
  ResponseSchema(z.object({}))
) {}
