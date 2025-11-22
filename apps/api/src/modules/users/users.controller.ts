import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  async updateMe(@Request() req, @Body() data: any) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  @Get('me/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les adresses de l\'utilisateur' })
  async getMyAddresses(@Request() req) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter une nouvelle adresse' })
  async createAddress(@Request() req, @Body() data: any) {
    return this.usersService.createAddress(req.user.id, data);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Obtenir le profil public d\'un utilisateur' })
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
