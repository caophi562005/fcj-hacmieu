import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

type PaymentStreamPayload = {
  userId: string;
  paymentId: string;
  paymentCode: string;
  message: string;
};

@Injectable()
export class PaymentStreamService {
  private readonly subject = new Subject<MessageEvent>();

  stream(): Observable<MessageEvent> {
    return this.subject.asObservable();
  }

  publish(payload: PaymentStreamPayload): void {
    this.subject.next({
      type: 'payment',
      data: payload,
    });
  }
}
