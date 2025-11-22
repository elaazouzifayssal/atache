import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('applications')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Postuler à un job' })
  async apply(@Param('jobId') jobId: string, @Request() req, @Body() data: any) {
    return this.applicationsService.apply(req.user.id, jobId, data);
  }

  @Get('jobs/:jobId/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Voir les candidatures d\'un job (client)' })
  async getJobApplications(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationsService.getJobApplications(jobId, req.user.id);
  }

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes candidatures (helper)' })
  async getMyApplications(@Request() req, @Query('status') status?: string) {
    return this.applicationsService.getHelperApplications(req.user.id, status);
  }

  @Post('applications/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accepter une candidature' })
  async accept(@Param('id') id: string, @Request() req) {
    return this.applicationsService.accept(id, req.user.id);
  }

  @Post('applications/:id/decline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refuser une candidature' })
  async decline(@Param('id') id: string, @Request() req) {
    return this.applicationsService.decline(id, req.user.id);
  }
}
