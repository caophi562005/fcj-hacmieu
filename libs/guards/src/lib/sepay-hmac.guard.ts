import { AuthConfiguration } from '@common/configurations/auth.config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SepayHmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const signature = request.headers['x-sepay-signature'] as string;
    const timestamp = request.headers['x-sepay-timestamp'] as string;

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing SePay signature headers');
    }

    const rawBody: string =
      typeof request.rawBody === 'string'
        ? request.rawBody
        : JSON.stringify(request.body ?? {});

    const payload = `${timestamp}.${rawBody}`;
    const expected = `sha256=${crypto
      .createHmac('sha256', AuthConfiguration.PAYMENT_SECRET)
      .update(payload)
      .digest('hex')}`;

    if (
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      throw new UnauthorizedException('Invalid SePay signature');
    }

    return true;
  }
}
