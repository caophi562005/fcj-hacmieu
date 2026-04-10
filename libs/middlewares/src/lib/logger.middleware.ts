import { MetadataKeys } from '@common/constants/common.constant';
import { getProcessId } from '@common/utils/process-id.util';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, body } = req;
    const processId = getProcessId();
    const now = Date.now();

    (req as any)[MetadataKeys.PROCESS_ID] = processId;
    (req as any)[MetadataKeys.START_TIME] = startTime;

    Logger.log(
      `HTTP >> Start process '${processId}' >> path: '${originalUrl}' >> method: '${method}' >> at: '${now}' >> input: ${JSON.stringify(
        body
      )}  `
    );

    const originalSend = res.send.bind(res);

    res.send = (body?: any) => {
      const duration = Date.now() - startTime;

      Logger.log(
        `HTTP >> End process '${processId}' >> path: '${originalUrl}' >> method: '${method}' >> at: '${now}' >> duration: ${duration}ms`
      );
      return originalSend(body);
    };
    next();
  }
}
