"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMatchDto = toMatchDto;
const me_dto_1 = require("../../users/dto/me.dto");
function toMatchDto(match) {
    const { userA, userB, ...rest } = match;
    return {
        ...rest,
        userA: userA ? (0, me_dto_1.toPublicUserDto)(userA) : undefined,
        userB: userB ? (0, me_dto_1.toPublicUserDto)(userB) : undefined,
    };
}
//# sourceMappingURL=match.dto.js.map