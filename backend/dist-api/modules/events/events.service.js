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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./entities/event.entity");
const event_participant_entity_1 = require("./entities/event-participant.entity");
let EventsService = class EventsService {
    events;
    participants;
    constructor(events, participants) {
        this.events = events;
        this.participants = participants;
    }
    async create(hostId, dto) {
        const startsAt = new Date(dto.startsAt);
        const endsAt = new Date(dto.endsAt);
        if (endsAt <= startsAt) {
            throw new common_1.BadRequestException('endsAt debe ser posterior a startsAt');
        }
        if (startsAt < new Date()) {
            throw new common_1.BadRequestException('No se pueden crear eventos en el pasado');
        }
        const event = this.events.create({
            hostId,
            title: dto.title,
            description: dto.description ?? null,
            startsAt,
            endsAt,
            maxParticipants: dto.maxParticipants ?? 50,
            status: event_entity_1.EventStatus.SCHEDULED,
        });
        return this.events.save(event);
    }
    async listUpcoming() {
        return this.events.find({
            where: { status: event_entity_1.EventStatus.SCHEDULED, startsAt: (0, typeorm_2.MoreThan)(new Date()) },
            relations: { host: true, participants: { user: true } },
            order: { startsAt: 'ASC' },
            take: 50,
        });
    }
    async findOne(id) {
        const event = await this.events.findOne({
            where: { id },
            relations: { host: true, participants: { user: true } },
        });
        if (!event)
            throw new common_1.NotFoundException('Evento no encontrado');
        return event;
    }
    async join(eventId, userId) {
        const event = await this.findOne(eventId);
        if (event.status !== event_entity_1.EventStatus.SCHEDULED) {
            throw new common_1.BadRequestException('No podés joinearte a este evento');
        }
        if ((event.participants?.length ?? 0) >= event.maxParticipants) {
            throw new common_1.BadRequestException('El evento está completo');
        }
        try {
            return await this.participants.save(this.participants.create({ eventId, userId, joinedAt: new Date() }));
        }
        catch (error) {
            const code = error.code;
            if (code === '23505')
                throw new common_1.ConflictException('Ya estás en este evento');
            throw error;
        }
    }
    async leave(eventId, userId) {
        await this.participants.delete({ eventId, userId });
    }
    async cancel(eventId, userId) {
        const event = await this.findOne(eventId);
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Solo el host puede cancelar');
        }
        event.status = event_entity_1.EventStatus.CANCELED;
        return this.events.save(event);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.SwapEvent)),
    __param(1, (0, typeorm_1.InjectRepository)(event_participant_entity_1.EventParticipant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map