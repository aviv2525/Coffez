import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface OrderEvent {
  userId: string;
  orderId: string;
  status: string;
  estimatedMinutes?: number | null;
}

@Injectable()
export class OrdersSseService {
  private events$ = new Subject<OrderEvent>();

  emit(event: OrderEvent) {
    this.events$.next(event);
  }

  streamForUser(userId: string) {
    return this.events$.pipe(
      filter((e) => e.userId === userId),
      map((e) => ({
        data: JSON.stringify({
          orderId: e.orderId,
          status: e.status,
          estimatedMinutes: e.estimatedMinutes ?? null,
        }),
      })),
    );
  }
}
