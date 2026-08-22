"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const configuration_1 = require("../../config/configuration");
const ws_throttle_guard_1 = require("../security/guards/ws-throttle.guard");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chat;
    jwt;
    config;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    constructor(chat, jwt, config) {
        this.chat = chat;
        this.jwt = jwt;
        this.config = config;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ??
                client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
            if (!token) {
                client.disconnect(true);
                return;
            }
            const payload = this.jwt.verify(token, {
                secret: this.config.getOrThrow('jwt').accessSecret,
            });
            client.data.user = payload;
            client.join(`user:${payload.sub}`);
            this.logger.debug(`User ${payload.sub} connected (${client.id})`);
        }
        catch (error) {
            this.logger.warn(`Connection rejected: ${error.message}`);
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        const userId = client.data.user?.sub;
        if (userId)
            this.logger.debug(`User ${userId} disconnected (${client.id})`);
    }
    async onJoin(client, body) {
        const user = this.requireUser(client);
        await this.chat.assertParticipant(body.matchId, user.sub);
        client.join(`match:${body.matchId}`);
        return { ok: true };
    }
    onLeave(client, body) {
        client.leave(`match:${body.matchId}`);
        return { ok: true };
    }
    async onSend(client, body) {
        const user = this.requireUser(client);
        const message = await this.chat.createMessage(body.matchId, user.sub, body.content, body.type);
        this.server.to(`match:${body.matchId}`).emit('chat:message', message);
        return message;
    }
    async onRead(client, body) {
        const user = this.requireUser(client);
        await this.chat.markAsRead(body.matchId, user.sub, body.messageIds);
        this.server.to(`match:${body.matchId}`).emit('chat:read', {
            matchId: body.matchId,
            messageIds: body.messageIds,
            readerId: user.sub,
        });
        return { ok: true };
    }
    onTyping(client, body) {
        const user = this.requireUser(client);
        client.to(`match:${body.matchId}`).emit('chat:typing', {
            matchId: body.matchId,
            userId: user.sub,
        });
    }
    emitMatchCreated(userIds, match) {
        userIds.forEach((id) => this.server.to(`user:${id}`).emit('match:new', match));
    }
    requireUser(client) {
        const user = client.data.user;
        if (!user)
            throw new websockets_1.WsException('Unauthorized');
        return user;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.JoinChatDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.JoinChatDto]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "onLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.ReadChatDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.JoinChatDto]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "onTyping", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, common_1.UseGuards)(ws_throttle_guard_1.WsThrottleGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: { origin: (0, configuration_1.parseOrigins)(process.env.FRONTEND_URL), credentials: true },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        config_1.ConfigService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map