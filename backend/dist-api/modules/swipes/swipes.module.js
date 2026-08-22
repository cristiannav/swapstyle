"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwipesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const swipe_entity_1 = require("./entities/swipe.entity");
const swipes_service_1 = require("./swipes.service");
const swipes_controller_1 = require("./swipes.controller");
const garment_entity_1 = require("../garments/entities/garment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const match_entity_1 = require("../matches/entities/match.entity");
let SwipesModule = class SwipesModule {
};
exports.SwipesModule = SwipesModule;
exports.SwipesModule = SwipesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([swipe_entity_1.Swipe, garment_entity_1.Garment, user_entity_1.User, match_entity_1.Match])],
        controllers: [swipes_controller_1.SwipesController],
        providers: [swipes_service_1.SwipesService],
        exports: [swipes_service_1.SwipesService],
    })
], SwipesModule);
//# sourceMappingURL=swipes.module.js.map