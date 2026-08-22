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
exports.Garment = exports.GarmentStatus = exports.GarmentCondition = exports.GarmentCategory = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const garment_image_entity_1 = require("./garment-image.entity");
var GarmentCategory;
(function (GarmentCategory) {
    GarmentCategory["TOP"] = "top";
    GarmentCategory["BOTTOM"] = "bottom";
    GarmentCategory["DRESS"] = "dress";
    GarmentCategory["OUTERWEAR"] = "outerwear";
    GarmentCategory["SHOES"] = "shoes";
    GarmentCategory["ACCESSORY"] = "accessory";
    GarmentCategory["BAG"] = "bag";
    GarmentCategory["OTHER"] = "other";
})(GarmentCategory || (exports.GarmentCategory = GarmentCategory = {}));
var GarmentCondition;
(function (GarmentCondition) {
    GarmentCondition["NEW"] = "new";
    GarmentCondition["LIKE_NEW"] = "like_new";
    GarmentCondition["GOOD"] = "good";
    GarmentCondition["FAIR"] = "fair";
})(GarmentCondition || (exports.GarmentCondition = GarmentCondition = {}));
var GarmentStatus;
(function (GarmentStatus) {
    GarmentStatus["AVAILABLE"] = "available";
    GarmentStatus["RESERVED"] = "reserved";
    GarmentStatus["SWAPPED"] = "swapped";
    GarmentStatus["HIDDEN"] = "hidden";
})(GarmentStatus || (exports.GarmentStatus = GarmentStatus = {}));
let Garment = class Garment extends base_entity_1.BaseEntity {
    ownerId;
    owner;
    title;
    description;
    category;
    brand;
    size;
    color;
    condition;
    status;
    isPremium;
    images;
};
exports.Garment = Garment;
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_id', type: 'uuid' }),
    __metadata("design:type", String)
], Garment.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], Garment.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Garment.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Garment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: GarmentCategory }),
    __metadata("design:type", String)
], Garment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 60, nullable: true }),
    __metadata("design:type", Object)
], Garment.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16, nullable: true }),
    __metadata("design:type", Object)
], Garment.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", Object)
], Garment.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: GarmentCondition }),
    __metadata("design:type", String)
], Garment.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: GarmentStatus, default: GarmentStatus.AVAILABLE }),
    __metadata("design:type", String)
], Garment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_premium', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Garment.prototype, "isPremium", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => garment_image_entity_1.GarmentImage, (img) => img.garment, { cascade: true }),
    __metadata("design:type", Array)
], Garment.prototype, "images", void 0);
exports.Garment = Garment = __decorate([
    (0, typeorm_1.Entity)('garments'),
    (0, typeorm_1.Index)(['ownerId', 'status']),
    (0, typeorm_1.Index)(['category', 'status'])
], Garment);
//# sourceMappingURL=garment.entity.js.map