import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PushService } from './push.service';
import { SubscribeDto, UnsubscribeDto } from './dto';

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('vapid-public')
  getVapidPublic() {
    return { publicKey: this.push.getPublicKey() };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(@CurrentUser() user: CurrentUserPayload, @Body() dto: SubscribeDto) {
    return this.push.subscribe(user.id, dto.subscription);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('unsubscribe')
  unsubscribe(@CurrentUser() user: CurrentUserPayload, @Body() dto: UnsubscribeDto) {
    return this.push.unsubscribe(user.id, dto.endpoint);
  }
}