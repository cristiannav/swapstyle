"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGarmentDto = toGarmentDto;
const me_dto_1 = require("../../users/dto/me.dto");
function toGarmentDto(garment) {
    const { owner, ...rest } = garment;
    return {
        ...rest,
        owner: owner ? (0, me_dto_1.toPublicUserDto)(owner) : undefined,
    };
}
//# sourceMappingURL=garment.dto.js.map