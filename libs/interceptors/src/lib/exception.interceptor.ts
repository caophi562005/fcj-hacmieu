import { MetadataKeys } from '@common/constants/common.constant';
import { HTTP_MESSAGE } from '@common/constants/http-message.constant';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { ZodSerializationException } from 'nestjs-zod';
import { catchError, map, Observable } from 'rxjs';

export interface StandardResponse<T = any> {
  data: T;
  message: string;
  statusCode: number;
  processId?: string;
  duration?: string;
}

export class ExceptionInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request: Request & {
      [MetadataKeys.PROCESS_ID]: string;
      [MetadataKeys.START_TIME]: number;
    } = ctx.getRequest();

    const processId = request[MetadataKeys.PROCESS_ID];
    const startTime = request[MetadataKeys.START_TIME];

    return next.handle().pipe(
      map((data) => {
        const durationMs = Date.now() - startTime;
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        // Trường hợp data là string, cho /metrics
        if (typeof data === 'string') {
          return data;
        }

        // Data đã đúng format chuẩn
        if (this.isStandardResponse(data)) {
          return {
            ...data,
            processId,
            duration: `${durationMs} ms`,
          };
        }

        // Nếu data có message field
        if (data && typeof data === 'object' && 'message' in data) {
          const { message, data: innerData, ...rest } = data;
          const responseData = innerData !== undefined ? innerData : rest;

          return {
            data: Object.keys(responseData).length > 0 ? responseData : {},
            message: message as string,
            statusCode,
            processId,
            duration: `${durationMs} ms`,
          };
        }

        // Trường hợp còn lại
        return {
          data: data || {},
          message: 'Success',
          statusCode,
          processId,
          duration: `${durationMs} ms`,
        };
      }),
      catchError((error) => {
        const durationMs = Date.now() - startTime;

        // Handle ZodSerializationException
        if (error instanceof ZodSerializationException) {
          const zodError: any = error.getZodError();
          Logger.error(
            `ZodSerializationException in process '${processId}': ${
              zodError?.message || 'Unknown error'
            }`
          );
          Logger.error('Zod validation errors:', zodError?.errors);

          throw new HttpException(
            {
              data: null,
              message: 'Error.ResponseSerializationFailed',
              errors:
                zodError?.errors?.map((err: any) => ({
                  path: err.path?.join('.') || '',
                  message: err.message,
                  code: err.code,
                })) || [],
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              duration: `${durationMs} ms`,
              processId,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }

        const message =
          error?.details ||
          error?.response?.message ||
          error.message ||
          error ||
          HTTP_MESSAGE.INTERNAL_SERVER_ERROR;

        // Fix: Map gRPC status codes (or other non-HTTP codes) to HTTP status codes
        let code =
          error?.response?.statusCode ||
          error.code ||
          HttpStatus.INTERNAL_SERVER_ERROR;

        if (typeof code === 'number' && (code < 100 || code > 599)) {
          // Mapping common gRPC codes to HTTP status
          switch (code) {
            case 3: // INVALID_ARGUMENT
              code = HttpStatus.BAD_REQUEST;
              break;
            case 5: // NOT_FOUND
              code = HttpStatus.NOT_FOUND;
              break;
            case 7: // PERMISSION_DENIED
              code = HttpStatus.FORBIDDEN;
              break;
            case 16: // UNAUTHENTICATED
              code = HttpStatus.UNAUTHORIZED;
              break;
            default:
              code = HttpStatus.INTERNAL_SERVER_ERROR;
              break;
          }
        } else if (typeof code !== 'number') {
          code = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        const response = error?.response;
        const data = response ? { ...response } : null;
        if (data && typeof data === 'object') {
          delete data.message;
          delete data.statusCode;
        }

        Logger.error(
          `HTTP >> Error process '${processId}' >> message: '${message}' >> code: '${code}'`
        );
        throw new HttpException(
          {
            data,
            message,
            statusCode: code,
            duration: `${durationMs} ms`,
            processId,
          },
          code
        );
      })
    );
  }

  private isStandardResponse(data: any): data is StandardResponse {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'message' in data &&
      'statusCode' in data
    );
  }
}
