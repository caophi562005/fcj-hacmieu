import { NotificationResponse } from '@common/interfaces/proto-types/utility';
import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationStreamService {
  private readonly subject = new Subject<MessageEvent>();

  stream(): Observable<MessageEvent> {
    return this.subject.asObservable();
  }

  publish(notification: NotificationResponse): void {
    this.subject.next({
      type: 'notification',
      data: notification,
    });
  }
}
