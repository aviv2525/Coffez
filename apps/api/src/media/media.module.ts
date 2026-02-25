import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [PrismaModule, SellersModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
