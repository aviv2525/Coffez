import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, SetAvailabilityDto } from './dto';

@ApiTags('menu')
@Controller()
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get('sellers/:id/menu')
  getBySellerId(@Param('id') sellerId: string) {
    return this.menu.getBySellerId(sellerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('menu')
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateMenuItemDto) {
    const sellerId = user.id;
    return this.menu.create(sellerId, user.id, {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      isAvailable: dto.isAvailable ?? true,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('menu/:id')
  update(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menu.update(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('menu/:id')
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.menu.delete(id, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('menu/:id/availability')
  setAvailability(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.menu.setAvailability(id, user.id, dto.isAvailable);
  }
}