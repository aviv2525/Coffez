import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { CreateProfileMediaDto, UpdateProfileMediaDto } from './dto';

@ApiTags('media')
@Controller('sellers')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(':id/media')
  getBySellerId(@Param('id') sellerId: string) {
    return this.media.getBySellerId(sellerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me/media')
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateProfileMediaDto) {
    return this.media.create(user.id, user.id, {
      type: dto.type,
      url: dto.url,
      thumbnailUrl: dto.thumbnailUrl,
      title: dto.title,
      caption: dto.caption,
      sortOrder: dto.sortOrder ?? 0,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/media/:id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') mediaId: string,
    @Body() dto: UpdateProfileMediaDto,
  ) {
    return this.media.update(mediaId, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me/media/:id')
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') mediaId: string) {
    return this.media.delete(mediaId, user.id);
  }
}