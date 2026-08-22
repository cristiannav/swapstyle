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
exports.SwipesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swipe_entity_1 = require("./entities/swipe.entity");
const garment_entity_1 = require("../garments/entities/garment.entity");
const match_entity_1 = require("../matches/entities/match.entity");
const user_entity_1 = require("../users/entities/user.entity");
let SwipesService = class SwipesService {
    swipes;
    garments;
    users;
    matches;
    dataSource;
    constructor(swipes, garments, users, matches, dataSource) {
        this.swipes = swipes;
        this.garments = garments;
        this.users = users;
        this.matches = matches;
        this.dataSource = dataSource;
    }
    async create(userId, dto) {
        const targetGarment = await this.garments.findOne({ where: { id: dto.garmentId } });
        if (!targetGarment)
            throw new common_1.NotFoundException('Prenda no encontrada');
        if (targetGarment.ownerId === userId) {
            throw new common_1.BadRequestException('No podés swipear tu propia prenda');
        }
        if (targetGarment.status !== garment_entity_1.GarmentStatus.AVAILABLE) {
            throw new common_1.BadRequestException('Esta prenda ya no está disponible');
        }
        if (dto.action === swipe_entity_1.SwipeAction.SUPER_LIKE) {
            const user = await this.users.findOneOrFail({ where: { id: userId } });
            if (user.superLikesRemaining <= 0) {
                throw new common_1.BadRequestException('No tenés Super Likes disponibles');
            }
        }
        return this.dataSource.transaction(async (em) => {
            try {
                await em.save(em.create(swipe_entity_1.Swipe, {
                    userId,
                    garmentId: dto.garmentId,
                    action: dto.action,
                }));
            }
            catch (error) {
                const code = error.code;
                if (code === '23505')
                    throw new common_1.ConflictException('Ya swipeaste esta prenda');
                throw error;
            }
            if (dto.action === swipe_entity_1.SwipeAction.SUPER_LIKE) {
                await em.decrement(user_entity_1.User, { id: userId }, 'superLikesRemaining', 1);
            }
            if (dto.action === swipe_entity_1.SwipeAction.PASS) {
                return { matched: false, match: null };
            }
            const reciprocalSwipe = await em
                .createQueryBuilder(swipe_entity_1.Swipe, 's')
                .innerJoin(garment_entity_1.Garment, 'g', 'g.id = s.garment_id')
                .where('s.user_id = :ownerId', { ownerId: targetGarment.ownerId })
                .andWhere('g.owner_id = :userId', { userId })
                .andWhere('s.action IN (:...likeActions)', {
                likeActions: [swipe_entity_1.SwipeAction.LIKE, swipe_entity_1.SwipeAction.SUPER_LIKE],
            })
                .orderBy('s.created_at', 'DESC')
                .getOne();
            if (!reciprocalSwipe)
                return { matched: false, match: null };
            const [garmentAId, garmentBId, userAId, userBId] = reciprocalSwipe.garmentId < targetGarment.id
                ? [reciprocalSwipe.garmentId, targetGarment.id, targetGarment.ownerId, userId]
                : [targetGarment.id, reciprocalSwipe.garmentId, userId, targetGarment.ownerId];
            const existing = await em.findOne(match_entity_1.Match, {
                where: { garmentAId, garmentBId },
            });
            if (existing)
                return { matched: true, match: existing };
            const match = await em.save(em.create(match_entity_1.Match, {
                userAId,
                userBId,
                garmentAId,
                garmentBId,
                status: match_entity_1.MatchStatus.ACTIVE,
            }));
            const fullMatch = await em.findOneOrFail(match_entity_1.Match, {
                where: { id: match.id },
                relations: { userA: true, userB: true, garmentA: { images: true }, garmentB: { images: true } },
            });
            return { matched: true, match: fullMatch };
        });
    }
};
exports.SwipesService = SwipesService;
exports.SwipesService = SwipesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(swipe_entity_1.Swipe)),
    __param(1, (0, typeorm_1.InjectRepository)(garment_entity_1.Garment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], SwipesService);
//# sourceMappingURL=swipes.service.js.map