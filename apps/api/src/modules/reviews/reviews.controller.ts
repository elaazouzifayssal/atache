import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('jobs/:jobId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createReview(@Param('jobId') jobId: string, @Request() req, @Body() data: any) {
    return this.reviewsService.createReview(req.user.id, jobId, data);
  }

  @Get('users/:userId/reviews')
  async getUserReviews(@Param('userId') userId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reviewsService.getUserReviews(userId, +page, +limit);
  }
}
