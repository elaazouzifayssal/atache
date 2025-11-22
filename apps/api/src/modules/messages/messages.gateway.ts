import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    // TODO: Verify JWT token from handshake
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, payload: { conversationId: string }) {
    client.join(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, payload: { conversationId: string }) {
    client.leave(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, payload: { conversationId: string; content: string }) {
    const userId = client.handshake.auth?.userId;
    if (!userId) return;

    const message = await this.messagesService.sendMessage(payload.conversationId, userId, payload.content);

    // Broadcast to conversation room
    this.server.to(`conversation:${payload.conversationId}`).emit('new_message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { conversationId: string }) {
    const userId = client.handshake.auth?.userId;
    client.to(`conversation:${payload.conversationId}`).emit('user_typing', { conversationId: payload.conversationId, userId });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(client: Socket, payload: { conversationId: string }) {
    const userId = client.handshake.auth?.userId;
    client.to(`conversation:${payload.conversationId}`).emit('user_stop_typing', { conversationId: payload.conversationId, userId });
  }

  // Helper method to send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
