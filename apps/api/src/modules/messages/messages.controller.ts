import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des conversations' })
  async getConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Messages d\'une conversation' })
  async getMessages(@Param('id') id: string, @Request() req, @Query('cursor') cursor?: string) {
    return this.messagesService.getMessages(id, req.user.id, cursor);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Envoyer un message' })
  async sendMessage(@Param('id') id: string, @Request() req, @Body() body: { content: string }) {
    return this.messagesService.sendMessage(id, req.user.id, body.content);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer comme lu' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.messagesService.markAsRead(id, req.user.id);
  }
}
