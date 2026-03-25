import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';

@ApiTags('reviews')
@Controller('sellers')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get(':id/reviews')
  getBySellerId(@Param('id') sellerId: string) {
    return this.reviews.getBySellerId(sellerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/reviews')
  create(
    @Param('id') sellerId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.upsert(user.id, sellerId, dto.rating, dto.comment);
  }
}
