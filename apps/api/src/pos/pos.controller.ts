import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PosService } from './pos.service';
import { CreatePosIntegrationDto, UpdatePosIntegrationDto, CreateMenuItemMappingDto } from './dto';

@ApiTags('pos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly pos: PosService) {}

  @Get()
  getIntegration(@CurrentUser() user: CurrentUserPayload) {
    return this.pos.getIntegration(user.id);
  }

  @Post()
  createIntegration(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreatePosIntegrationDto) {
    return this.pos.createIntegration(user.id, dto);
  }

  @Patch()
  updateIntegration(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdatePosIntegrationDto) {
    return this.pos.updateIntegration(user.id, dto);
  }

  @Delete()
  deleteIntegration(@CurrentUser() user: CurrentUserPayload) {
    return this.pos.deleteIntegration(user.id);
  }

  @Post('mappings')
  upsertMapping(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateMenuItemMappingDto) {
    return this.pos.upsertMapping(user.id, dto);
  }

  @Delete('mappings/:menuItemId')
  deleteMapping(@CurrentUser() user: CurrentUserPayload, @Param('menuItemId') menuItemId: string) {
    return this.pos.deleteMapping(user.id, menuItemId);
  }
}
