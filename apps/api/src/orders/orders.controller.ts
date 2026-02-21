import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderStatus } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('all')
  findAllOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orders.findAllOrders(Number(page) || 1, Number(limit) || 20, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyOrders(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orders.findMyOrders(user.id, Number(page) || 1, Number(limit) || 20, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  findIncomingOrders(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orders.findIncomingOrders(user.id, Number(page) || 1, Number(limit) || 20, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatus(orderId, user.id, user.role, dto.status as OrderStatus);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: CurrentUserPayload, @Param('id') orderId: string) {
    return this.orders.cancel(orderId, user.id, user.role);
  }
}