import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle demande de job' })
  async create(@Request() req, @Body() data: any) {
    return this.jobsService.create(req.user.id, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechercher des jobs (pour helpers)' })
  async findAll(@Query() filters: any) {
    return this.jobsService.findAll(filters);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes jobs (client)' })
  async getMyJobs(@Request() req, @Query('status') status?: string) {
    return this.jobsService.getClientJobs(req.user.id, status as any);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Détails d\'un job' })
  async findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Démarrer un job (helper)' })
  async startJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.updateStatus(id, req.user.id, 'IN_PROGRESS', { startedAt: new Date() });
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminer un job (helper)' })
  async completeJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.updateStatus(id, req.user.id, 'PENDING_REVIEW');
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmer la fin du job (client)' })
  async confirmJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.updateStatus(id, req.user.id, 'COMPLETED', { completedAt: new Date() });
  }
}
