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
exports.GarmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const garments_service_1 = require("./garments.service");
const create_garment_dto_1 = require("./dto/create-garment.dto");
const update_garment_dto_1 = require("./dto/update-garment.dto");
const feed_query_dto_1 = require("./dto/feed-query.dto");
const garment_dto_1 = require("./dto/garment.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let GarmentsController = class GarmentsController {
    garments;
    constructor(garments) {
        this.garments = garments;
    }
    create(user, dto) {
        return this.garments.create(user.sub, dto);
    }
    feed(user, query) {
        return this.garments.feed(user.sub, query);
    }
    mine(user) {
        return this.garments.findByOwner(user.sub);
    }
    async findOne(id) {
        return (0, garment_dto_1.toGarmentDto)(await this.garments.findOne(id));
    }
    async update(user, id, dto) {
        return (0, garment_dto_1.toGarmentDto)(await this.garments.update(id, user.sub, dto));
    }
    remove(user, id) {
        return this.garments.remove(id, user.sub);
    }
};
exports.GarmentsController = GarmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_garment_dto_1.CreateGarmentDto]),
    __metadata("design:returntype", void 0)
], GarmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, feed_query_dto_1.FeedQueryDto]),
    __metadata("design:returntype", void 0)
], GarmentsController.prototype, "feed", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GarmentsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GarmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_garment_dto_1.UpdateGarmentDto]),
    __metadata("design:returntype", Promise)
], GarmentsController.prototype, "update", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GarmentsController.prototype, "remove", null);
exports.GarmentsController = GarmentsController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('garments'),
    (0, common_1.Controller)('garments'),
    __metadata("design:paramtypes", [garments_service_1.GarmentsService])
], GarmentsController);
//# sourceMappingURL=garments.controller.js.map