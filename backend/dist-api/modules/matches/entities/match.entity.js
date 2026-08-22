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
exports.Match = exports.MatchStatus = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const garment_entity_1 = require("../../garments/entities/garment.entity");
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["ACTIVE"] = "active";
    MatchStatus["ARCHIVED"] = "archived";
    MatchStatus["COMPLETED"] = "completed";
    MatchStatus["CANCELED"] = "canceled";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
let Match = class Match extends base_entity_1.BaseEntity {
    userAId;
    userA;
    userBId;
    userB;
    garmentAId;
    garmentA;
    garmentBId;
    garmentB;
    status;
    lastMessageAt;
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_a_id', type: 'uuid' }),
    __metadata("design:type", String)
], Match.prototype, "userAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_a_id' }),
    __metadata("design:type", user_entity_1.User)
], Match.prototype, "userA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_b_id', type: 'uuid' }),
    __metadata("design:type", String)
], Match.prototype, "userBId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_b_id' }),
    __metadata("design:type", user_entity_1.User)
], Match.prototype, "userB", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'garment_a_id', type: 'uuid' }),
    __metadata("design:type", String)
], Match.prototype, "garmentAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => garment_entity_1.Garment, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'garment_a_id' }),
    __metadata("design:type", garment_entity_1.Garment)
], Match.prototype, "garmentA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'garment_b_id', type: 'uuid' }),
    __metadata("design:type", String)
], Match.prototype, "garmentBId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => garment_entity_1.Garment, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'garment_b_id' }),
    __metadata("design:type", garment_entity_1.Garment)
], Match.prototype, "garmentB", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MatchStatus, default: MatchStatus.ACTIVE }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_message_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Match.prototype, "lastMessageAt", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches'),
    (0, typeorm_1.Unique)('UQ_match_garments', ['garmentAId', 'garmentBId']),
    (0, typeorm_1.Index)(['userAId', 'status']),
    (0, typeorm_1.Index)(['userBId', 'status'])
], Match);
//# sourceMappingURL=match.entity.js.map