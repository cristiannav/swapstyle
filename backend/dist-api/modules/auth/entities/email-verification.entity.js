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
exports.VerificationToken = exports.VerificationPurpose = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var VerificationPurpose;
(function (VerificationPurpose) {
    VerificationPurpose["EMAIL_VERIFICATION"] = "email_verification";
    VerificationPurpose["PASSWORD_RESET"] = "password_reset";
})(VerificationPurpose || (exports.VerificationPurpose = VerificationPurpose = {}));
let VerificationToken = class VerificationToken extends base_entity_1.BaseEntity {
    userId;
    user;
    tokenHash;
    purpose;
    expiresAt;
    usedAt;
};
exports.VerificationToken = VerificationToken;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], VerificationToken.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], VerificationToken.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: 'token_hash', type: 'text' }),
    __metadata("design:type", String)
], VerificationToken.prototype, "tokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VerificationPurpose,
    }),
    __metadata("design:type", String)
], VerificationToken.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], VerificationToken.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], VerificationToken.prototype, "usedAt", void 0);
exports.VerificationToken = VerificationToken = __decorate([
    (0, typeorm_1.Entity)('verification_tokens')
], VerificationToken);
//# sourceMappingURL=email-verification.entity.js.map