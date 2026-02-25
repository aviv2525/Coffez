import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';



@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {
    console.log('Prisma injected?', !!prisma);
    console.log('paramtypes:', Reflect.getMetadata('design:paramtypes', HealthController));

  }

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (e) {
      console.error('HEALTH DB ERROR:', e instanceof Error ? e.message : e);
      return { status: 'error', database: 'disconnected' };
    }
  }
}
