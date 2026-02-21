import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { SellersService } from './sellers.service';
import { CreateSellerProfileDto, UpdateSellerProfileDto } from './dto';

@ApiTags('sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellers: SellersService) {}

  @Get()
  list(@Query('page') page?: number, @Query('limit') limit?: number, @Query('category') category?: string) {
    return this.sellers.list(Number(page) || 1, Number(limit) || 20, category);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.sellers.getMyProfile(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me')
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateSellerProfileDto) {
    return this.sellers.create(user.id, {
      displayName: dto.displayName,
      bio: dto.bio,
      categories: dto.categories ?? [],
      locationText: dto.locationText,
      avatarUrl: dto.avatarUrl,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateSellerProfileDto) {
    return this.sellers.update(user.id, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sellers.getById(id);
  }
}
