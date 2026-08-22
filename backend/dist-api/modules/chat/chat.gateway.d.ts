import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinChatDto, ReadChatDto, SendMessageDto } from './dto/send-message.dto';
import type { JwtPayload } from '../auth/types/jwt-payload';
interface AuthedSocket extends Socket {
    data: {
        user?: JwtPayload;
    };
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chat;
    private readonly jwt;
    private readonly config;
    server: Server;
    private readonly logger;
    constructor(chat: ChatService, jwt: JwtService, config: ConfigService);
    handleConnection(client: AuthedSocket): Promise<void>;
    handleDisconnect(client: AuthedSocket): void;
    onJoin(client: AuthedSocket, body: JoinChatDto): Promise<{
        ok: true;
    }>;
    onLeave(client: AuthedSocket, body: JoinChatDto): {
        ok: true;
    };
    onSend(client: AuthedSocket, body: SendMessageDto): Promise<import("./entities/message.entity").Message>;
    onRead(client: AuthedSocket, body: ReadChatDto): Promise<{
        ok: true;
    }>;
    onTyping(client: AuthedSocket, body: JoinChatDto): void;
    emitMatchCreated(userIds: string[], match: unknown): void;
    private requireUser;
}
export {};
