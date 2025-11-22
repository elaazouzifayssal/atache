import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(reviewerId: string, jobId: string, data: any) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'COMPLETED') throw new ForbiddenException('Le job doit être terminé');

    // Check if review already exists
    const existing = await this.prisma.review.findUnique({ where: { jobId } });
    if (existing) throw new ConflictException('Un avis existe déjà pour ce job');

    // Determine reviewee (the other party)
    const isClient = job.clientId === reviewerId;
    const revieweeId = isClient ? job.assignedHelperId : job.clientId;

    const review = await this.prisma.review.create({
      data: {
        jobId,
        reviewerId,
        revieweeId,
        isClientReview: !isClient,
        ...data,
      },
    });

    // Update helper stats if reviewing a helper
    if (isClient && job.assignedHelperId) {
      await this.updateHelperStats(job.assignedHelperId);
    }

    return review;
  }

  async getUserReviews(userId: string, page = 1, limit = 10) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        job: { select: { title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  private async updateHelperStats(helperId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId: helperId, isClientReview: false },
      select: { overallRating: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews
      : 0;

    await this.prisma.helperProfile.update({
      where: { userId: helperId },
      data: { averageRating, totalReviews },
    });
  }
}
