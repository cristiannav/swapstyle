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
exports.GarmentImage = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../../database/base.entity");
const garment_entity_1 = require("./garment.entity");
let GarmentImage = class GarmentImage extends base_entity_1.BaseEntity {
    garmentId;
    garment;
    url;
    position;
};
exports.GarmentImage = GarmentImage;
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'garment_id', type: 'uuid' }),
    __metadata("design:type", String)
], GarmentImage.prototype, "garmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => garment_entity_1.Garment, (g) => g.images, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'garment_id' }),
    __metadata("design:type", garment_entity_1.Garment)
], GarmentImage.prototype, "garment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], GarmentImage.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GarmentImage.prototype, "position", void 0);
exports.GarmentImage = GarmentImage = __decorate([
    (0, typeorm_1.Entity)('garment_images')
], GarmentImage);
//# sourceMappingURL=garment-image.entity.js.map