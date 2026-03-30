import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SellersModule } from './sellers/sellers.module';
import { MenuModule } from './menu/menu.module';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PushModule } from './push/push.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 min
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 600000, // 10 min
        limit: 5,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SellersModule,
    MenuModule,
    MediaModule,
    OrdersModule,
    NotificationsModule,
    PushModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
