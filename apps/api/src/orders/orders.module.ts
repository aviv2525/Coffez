import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersSseService } from './orders-sse.service';
import { PushModule } from '../push/push.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebhookModule } from '../webhook/webhook.module';
import { PosModule } from '../pos/pos.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersSseService],
  exports: [OrdersService, OrdersSseService],
  imports: [PushModule, NotificationsModule, WebhookModule, PosModule],
})
export class OrdersModule {}
