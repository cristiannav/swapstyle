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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const match_entity_1 = require("../matches/entities/match.entity");
let ChatService = class ChatService {
    messages;
    matches;
    constructor(messages, matches) {
        this.messages = messages;
        this.matches = matches;
    }
    async assertParticipant(matchId, userId) {
        const match = await this.matches.findOne({ where: { id: matchId } });
        if (!match)
            throw new common_1.NotFoundException('Match no encontrado');
        if (match.userAId !== userId && match.userBId !== userId) {
            throw new common_1.ForbiddenException('No pertenecés a este match');
        }
        return match;
    }
    async listMessages(matchId, userId, options = {}) {
        await this.assertParticipant(matchId, userId);
        const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
        const where = { matchId };
        if (options.before) {
            where.createdAt = (0, typeorm_2.LessThan)(new Date(options.before));
        }
        return this.messages.find({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async createMessage(matchId, senderId, content, type = message_entity_1.MessageType.TEXT) {
        await this.assertParticipant(matchId, senderId);
        const message = await this.messages.save(this.messages.create({ matchId, senderId, content, type }));
        await this.matches.update({ id: matchId }, { lastMessageAt: message.createdAt });
        return message;
    }
    async markAsRead(matchId, userId, messageIds) {
        if (messageIds.length === 0)
            return;
        await this.assertParticipant(matchId, userId);
        await this.messages
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ readAt: () => 'NOW()' })
            .where('id IN (:...ids)', { ids: messageIds })
            .andWhere('match_id = :matchId', { matchId })
            .andWhere('sender_id != :userId', { userId })
            .andWhere('read_at IS NULL')
            .execute();
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map