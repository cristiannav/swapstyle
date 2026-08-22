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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParticipant = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const event_entity_1 = require("./event.entity");
let EventParticipant = class EventParticipant extends base_entity_1.BaseEntity {
    eventId;
    event;
    userId;
    user;
    joinedAt;
};
exports.EventParticipant = EventParticipant;
__decorate([
    (0, typeorm_1.Column)({ name: 'event_id', type: 'uuid' }),
    __metadata("design:type", String)
], EventParticipant.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.SwapEvent, (e) => e.participants, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", event_entity_1.SwapEvent)
], EventParticipant.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], EventParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], EventParticipant.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joined_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EventParticipant.prototype, "joinedAt", void 0);
exports.EventParticipant = EventParticipant = __decorate([
    (0, typeorm_1.Entity)('event_participants'),
    (0, typeorm_1.Unique)('UQ_event_user', ['eventId', 'userId'])
], EventParticipant);
//# sourceMappingURL=event-participant.entity.js.map