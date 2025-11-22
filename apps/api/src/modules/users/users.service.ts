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

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, data: {
    label: string;
    street: string;
    city: string;
    neighborhood?: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
  }) {
    // If this is set as default, unset other defaults first
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }
}
