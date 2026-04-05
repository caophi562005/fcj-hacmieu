import { HTTP_MESSAGE } from '@common/constants/http-message.constant';
import { toPlain } from '@common/utils/to-plain.util';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, map, Observable, tap } from 'rxjs';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();
    const handler = context.getHandler();
    const handlerName = handler.name;

    const args = context.getArgs();

    const param = args[0];
    const processId = param?.processId || 'Unknown ProcessId';

    Logger.log(
      `gRPC >> Start process: '${processId}' >> method: '${handlerName}' at '${now}' >> param: ${JSON.stringify(
        param
      )}`
    );

    return next.handle().pipe(
      map((data) => toPlain(data)),
      tap((data) => {
        const logMessage = `gRPC >> End process: '${processId}' >> method: '${handlerName}' >> duration: '${
          Date.now() - now
        } ms'`;
        // ${
        //   BaseConfiguration.NODE_ENV === 'development'
        //     ? ` >> response: ${JSON.stringify(data)}`
        //     : ''
        // }

        Logger.log(logMessage);
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        // Logger.error(error);
        Logger.error(
          `gRPC >> Error process '${processId}' >> message: ${error.message} >> code: ${error.status} >> after: '${duration}ms'`
        );

        throw new RpcException({
          code:
            error.status ||
            error.code ||
            error.error?.code ||
            HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error.response?.message ||
            error.message ||
            HTTP_MESSAGE.INTERNAL_SERVER_ERROR,
        });
      })
    );
  }
}
