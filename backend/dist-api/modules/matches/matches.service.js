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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./entities/match.entity");
const match_dto_1 = require("./dto/match.dto");
let MatchesService = class MatchesService {
    matches;
    constructor(matches) {
        this.matches = matches;
    }
    async findForUser(userId) {
        const rows = await this.matches
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.userA', 'userA')
            .leftJoinAndSelect('m.userB', 'userB')
            .leftJoinAndSelect('m.garmentA', 'garmentA')
            .leftJoinAndSelect('garmentA.images', 'gaImg')
            .leftJoinAndSelect('m.garmentB', 'garmentB')
            .leftJoinAndSelect('garmentB.images', 'gbImg')
            .where('m.status = :status', { status: match_entity_1.MatchStatus.ACTIVE })
            .andWhere('(m.user_a_id = :userId OR m.user_b_id = :userId)', { userId })
            .orderBy('COALESCE(m.last_message_at, m.created_at)', 'DESC')
            .getMany();
        return rows.map(match_dto_1.toMatchDto);
    }
    async findOne(id, userId) {
        const match = await this.matches.findOne({
            where: { id },
            relations: {
                userA: true,
                userB: true,
                garmentA: { images: true },
                garmentB: { images: true },
            },
        });
        if (!match)
            throw new common_1.NotFoundException('Match no encontrado');
        if (match.userAId !== userId && match.userBId !== userId) {
            throw new common_1.ForbiddenException('No tenés acceso a este match');
        }
        return match;
    }
    async archive(id, userId) {
        const match = await this.findOne(id, userId);
        match.status = match_entity_1.MatchStatus.ARCHIVED;
        return this.matches.save(match);
    }
    async cancel(id, userId) {
        const match = await this.findOne(id, userId);
        match.status = match_entity_1.MatchStatus.CANCELED;
        return this.matches.save(match);
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MatchesService);
//# sourceMappingURL=matches.service.js.map