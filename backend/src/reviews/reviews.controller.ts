import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.reviewsService.listForProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @Req() req: Request,
  ) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.reviewsService.create(productId, user.id, dto);
  }
}
