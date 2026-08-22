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
exports.GarmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const garment_entity_1 = require("./entities/garment.entity");
const garment_image_entity_1 = require("./entities/garment-image.entity");
const garment_dto_1 = require("./dto/garment.dto");
let GarmentsService = class GarmentsService {
    garments;
    images;
    dataSource;
    constructor(garments, images, dataSource) {
        this.garments = garments;
        this.images = images;
        this.dataSource = dataSource;
    }
    async create(ownerId, dto) {
        return this.dataSource.transaction(async (em) => {
            const garment = await em.save(em.create(garment_entity_1.Garment, {
                ownerId,
                title: dto.title,
                description: dto.description ?? null,
                category: dto.category,
                brand: dto.brand ?? null,
                size: dto.size ?? null,
                color: dto.color ?? null,
                condition: dto.condition,
                status: garment_entity_1.GarmentStatus.AVAILABLE,
            }));
            const images = dto.imageUrls.map((url, position) => em.create(garment_image_entity_1.GarmentImage, { garmentId: garment.id, url, position }));
            await em.save(images);
            garment.images = images;
            return garment;
        });
    }
    async findOne(id) {
        const garment = await this.garments.findOne({
            where: { id },
            relations: { images: true, owner: true },
        });
        if (!garment)
            throw new common_1.NotFoundException('Prenda no encontrada');
        return garment;
    }
    async findByOwner(ownerId) {
        return this.garments.find({
            where: { ownerId },
            relations: { images: true },
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, ownerId, dto) {
        const garment = await this.findOne(id);
        if (garment.ownerId !== ownerId)
            throw new common_1.ForbiddenException('No es tu prenda');
        Object.assign(garment, {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.category !== undefined && { category: dto.category }),
            ...(dto.brand !== undefined && { brand: dto.brand }),
            ...(dto.size !== undefined && { size: dto.size }),
            ...(dto.color !== undefined && { color: dto.color }),
            ...(dto.condition !== undefined && { condition: dto.condition }),
            ...(dto.status !== undefined && { status: dto.status }),
        });
        await this.garments.save(garment);
        return this.findOne(id);
    }
    async remove(id, ownerId) {
        const garment = await this.findOne(id);
        if (garment.ownerId !== ownerId)
            throw new common_1.ForbiddenException('No es tu prenda');
        await this.garments.delete({ id });
    }
    async feed(userId, query) {
        const limit = query.limit ?? 20;
        const qb = this.garments
            .createQueryBuilder('g')
            .leftJoinAndSelect('g.images', 'img')
            .leftJoinAndSelect('g.owner', 'owner')
            .where('g.status = :status', { status: garment_entity_1.GarmentStatus.AVAILABLE })
            .andWhere('g.owner_id != :userId', { userId })
            .andWhere(`NOT EXISTS (
          SELECT 1 FROM swipes s
          WHERE s.user_id = :userId AND s.garment_id = g.id
        )`)
            .orderBy('g.created_at', 'DESC')
            .addOrderBy('g.id', 'DESC')
            .limit(limit + 1);
        if (query.cursor) {
            const decoded = this.decodeCursor(query.cursor);
            if (decoded) {
                qb.andWhere('(g.created_at, g.id) < (:cursorDate, :cursorId)', { cursorDate: decoded.createdAt, cursorId: decoded.id });
            }
        }
        if (query.category?.length) {
            qb.andWhere('g.category IN (:...categories)', { categories: query.category });
        }
        if (query.size) {
            qb.andWhere('g.size = :size', { size: query.size });
        }
        if (query.city) {
            qb.andWhere('LOWER(owner.city) = LOWER(:city)', { city: query.city });
        }
        const rows = await qb.getMany();
        const hasMore = rows.length > limit;
        const items = rows.slice(0, limit);
        const last = items[items.length - 1];
        const nextCursor = hasMore && last
            ? this.encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
            : null;
        return { items: items.map(garment_dto_1.toGarmentDto), nextCursor, hasMore };
    }
    encodeCursor(c) {
        return Buffer.from(JSON.stringify(c)).toString('base64url');
    }
    decodeCursor(cursor) {
        try {
            return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        }
        catch {
            return null;
        }
    }
};
exports.GarmentsService = GarmentsService;
exports.GarmentsService = GarmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(garment_entity_1.Garment)),
    __param(1, (0, typeorm_1.InjectRepository)(garment_image_entity_1.GarmentImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], GarmentsService);
//# sourceMappingURL=garments.service.js.map