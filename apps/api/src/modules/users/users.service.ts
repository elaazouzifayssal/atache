import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { helperProfile: { include: { skills: { include: { category: true } } } } },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        city: true,
        role: true,
        createdAt: true,
        helperProfile: {
          select: {
            bio: true,
            averageRating: true,
            totalReviews: true,
            totalJobsCompleted: true,
            isVerified: true,
            portfolioPhotos: true,
            skills: { include: { category: true } },
          },
        },
      },
    });

    if (user) {
      // Truncate last name for privacy
      user.lastName = user.lastName.charAt(0) + '.';
    }

    return user;
  }
}
