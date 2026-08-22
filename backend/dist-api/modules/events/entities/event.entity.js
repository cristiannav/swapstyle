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
exports.SwapEvent = exports.EventStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const event_participant_entity_1 = require("./event-participant.entity");
var EventStatus;
(function (EventStatus) {
    EventStatus["SCHEDULED"] = "scheduled";
    EventStatus["LIVE"] = "live";
    EventStatus["ENDED"] = "ended";
    EventStatus["CANCELED"] = "canceled";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
let SwapEvent = class SwapEvent extends base_entity_1.BaseEntity {
    title;
    description;
    hostId;
    host;
    startsAt;
    endsAt;
    maxParticipants;
    status;
    participants;
};
exports.SwapEvent = SwapEvent;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], SwapEvent.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SwapEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'host_id', type: 'uuid' }),
    __metadata("design:type", String)
], SwapEvent.prototype, "hostId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'host_id' }),
    __metadata("design:type", user_entity_1.User)
], SwapEvent.prototype, "host", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'starts_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SwapEvent.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ends_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SwapEvent.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_participants', type: 'int', default: 50 }),
    __metadata("design:type", Number)
], SwapEvent.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED }),
    __metadata("design:type", String)
], SwapEvent.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_participant_entity_1.EventParticipant, (p) => p.event),
    __metadata("design:type", Array)
], SwapEvent.prototype, "participants", void 0);
exports.SwapEvent = SwapEvent = __decorate([
    (0, typeorm_1.Entity)('events'),
    (0, typeorm_1.Index)(['startsAt', 'status'])
], SwapEvent);
//# sourceMappingURL=event.entity.js.map