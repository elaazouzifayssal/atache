import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(helperId: string, jobId: string, data: { message?: string; proposedRate?: number }) {
    // Check if job exists and is open
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job non trouvé');
    if (job.status !== 'OPEN') throw new ConflictException('Ce job n\'accepte plus de candidatures');

    // Check if already applied
    const existing = await this.prisma.application.findUnique({
      where: { jobId_helperId: { jobId, helperId } },
    });
    if (existing) throw new ConflictException('Vous avez déjà postulé à ce job');

    return this.prisma.application.create({
      data: { jobId, helperId, ...data },
      include: { job: true },
    });
  }

  async getJobApplications(jobId: string, clientId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.clientId !== clientId) throw new ForbiddenException();

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        helper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            helperProfile: { select: { averageRating: true, totalReviews: true } },
          },
        },
      },
    });
  }

  async getHelperApplications(helperId: string, status?: string) {
    const where: any = { helperId };
    if (status) where.status = status;

    return this.prisma.application.findMany({
      where,
      include: { job: { include: { category: true, address: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(applicationId: string, clientId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.clientId !== clientId) {
      throw new ForbiddenException();
    }

    // Accept this application and decline others
    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.application.updateMany({
        where: { jobId: application.jobId, id: { not: applicationId } },
        data: { status: 'DECLINED' },
      }),
      this.prisma.job.update({
        where: { id: application.jobId },
        data: { status: 'ASSIGNED', assignedHelperId: application.helperId },
      }),
      // Create conversation
      this.prisma.conversation.create({
        data: {
          jobId: application.jobId,
          participants: {
            create: [{ userId: clientId }, { userId: application.helperId }],
          },
        },
      }),
    ]);

    return { success: true };
  }

  async decline(applicationId: string, clientId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.clientId !== clientId) {
      throw new ForbiddenException();
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'DECLINED' },
    });
  }
}
