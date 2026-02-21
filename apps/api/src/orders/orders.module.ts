import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PushModule } from '../push/push.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
  imports: [PushModule, NotificationsModule],
})
export class OrdersModule {}
