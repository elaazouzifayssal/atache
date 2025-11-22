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
    const { helperProfile, ...userData } = data;

    let updatedUser;
    if (helperProfile) {
      const { skills, ...profileData } = helperProfile;

      // Update user, helper profile, and skills in a transaction
      updatedUser = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.update({ where: { id: userId }, data: userData });

        const profile = await prisma.helperProfile.upsert({
          where: { userId },
          update: profileData,
          create: { ...profileData, userId },
        });

        // Handle skills updates
        if (skills) {
          // Delete existing skills
          await prisma.helperSkill.deleteMany({
            where: { helperProfileId: profile.id },
          });

          // Add new skills
          if (skills.length > 0) {
            await prisma.helperSkill.createMany({
              data: skills.map((skill: any) => ({
                helperProfileId: profile.id,
                categoryId: skill.categoryId,
                hourlyRate: skill.hourlyRate,
              })),
            });
          }
        }

        return prisma.user.findUnique({
          where: { id: userId },
          include: { helperProfile: { include: { skills: { include: { category: true } } } } },
        });
      });
    } else {
      updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: userData,
        include: { helperProfile: { include: { skills: { include: { category: true } } } } },
      });
    }

    return updatedUser;
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
