import { Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinChatDto, ReadChatDto, SendMessageDto } from './dto/send-message.dto';
import type { JwtConfig } from '../../config/configuration';
import type { JwtPayload } from '../auth/types/jwt-payload';
import { WsThrottleGuard } from '../security/guards/ws-throttle.guard';

interface AuthedSocket extends Socket {
  data: { user?: JwtPayload };
}

@UseGuards(WsThrottleGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@WebSocketGateway({
  namespace: '/chat',
  // `origin: true` reflejaba cualquier Origin. Las opciones del decorador se
  // evalúan al cargar la clase, así que no hay ConfigService todavía: se lee
  // el env directo, igual que hace configuration().
  cors: {
    origin: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chat: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') as string | undefined);

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<JwtConfig>('jwt').accessSecret,
      });
      client.data.user = payload;
      client.join(`user:${payload.sub}`);
      this.logger.debug(`User ${payload.sub} connected (${client.id})`);
    } catch (error) {
      this.logger.warn(`Connection rejected: ${(error as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket): void {
    const userId = client.data.user?.sub;
    if (userId) this.logger.debug(`User ${userId} disconnected (${client.id})`);
  }

  @SubscribeMessage('chat:join')
  async onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: JoinChatDto,
  ): Promise<{ ok: true }> {
    const user = this.requireUser(client);
    await this.chat.assertParticipant(body.matchId, user.sub);
    client.join(`match:${body.matchId}`);
    return { ok: true };
  }

  @SubscribeMessage('chat:leave')
  onLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: JoinChatDto,
  ): { ok: true } {
    client.leave(`match:${body.matchId}`);
    return { ok: true };
  }

  @SubscribeMessage('chat:send')
  async onSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: SendMessageDto,
  ) {
    const user = this.requireUser(client);
    const message = await this.chat.createMessage(body.matchId, user.sub, body.content, body.type);
    this.server.to(`match:${body.matchId}`).emit('chat:message', message);
    return message;
  }

  @SubscribeMessage('chat:read')
  async onRead(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: ReadChatDto,
  ): Promise<{ ok: true }> {
    const user = this.requireUser(client);
    await this.chat.markAsRead(body.matchId, user.sub, body.messageIds);
    this.server.to(`match:${body.matchId}`).emit('chat:read', {
      matchId: body.matchId,
      messageIds: body.messageIds,
      readerId: user.sub,
    });
    return { ok: true };
  }

  @SubscribeMessage('chat:typing')
  onTyping(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: JoinChatDto,
  ): void {
    const user = this.requireUser(client);
    client.to(`match:${body.matchId}`).emit('chat:typing', {
      matchId: body.matchId,
      userId: user.sub,
    });
  }

  /** Útil desde otros módulos para notificar matches en vivo. */
  emitMatchCreated(userIds: string[], match: unknown): void {
    userIds.forEach((id) => this.server.to(`user:${id}`).emit('match:new', match));
  }

  private requireUser(client: AuthedSocket): JwtPayload {
    const user = client.data.user;
    if (!user) throw new WsException('Unauthorized');
    return user;
  }
}
