import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, data: any) {
    const address = await this.prisma.address.findUnique({ where: { id: data.addressId } });
    if (!address || address.userId !== clientId) {
      throw new ForbiddenException('Adresse invalide');
    }

    return this.prisma.job.create({
      data: {
        ...data,
        clientId,
        latitude: address.latitude,
        longitude: address.longitude,
        status: JobStatus.OPEN,
      },
      include: { category: true, address: true },
    });
  }

  async findAll(filters: any) {
    const { categoryId, city, lat, lng, radius = 20, status = 'OPEN', page = 1, limit = 20 } = filters;

    const where: any = { status };
    if (categoryId) where.categoryId = categoryId;
    if (city) where.address = { city };

    const jobs = await this.prisma.job.findMany({
      where,
      include: {
        category: true,
        address: { select: { city: true, neighborhood: true } },
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate distance if lat/lng provided
    if (lat && lng) {
      return jobs.map((job) => ({
        ...job,
        applicationsCount: job._count.applications,
        distance: this.calculateDistance(lat, lng, job.latitude, job.longitude),
      }));
    }

    return jobs.map((job) => ({
      ...job,
      applicationsCount: job._count.applications,
    }));
  }

  async findById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        address: true,
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        applications: { include: { helper: true } },
      },
    });

    if (!job) throw new NotFoundException('Job non trouvé');
    return job;
  }

  async getClientJobs(clientId: string, status?: JobStatus) {
    const where: any = { clientId };
    if (status) where.status = status;

    return this.prisma.job.findMany({
      where,
      include: {
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(jobId: string, userId: string, newStatus: JobStatus, data?: any) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job non trouvé');

    // Validate status transition and permissions
    // ... (add validation logic)

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus, ...data },
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}
