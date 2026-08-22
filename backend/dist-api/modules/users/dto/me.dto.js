"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMeDto = toMeDto;
exports.toPublicUserDto = toPublicUserDto;
function toMeDto(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        birthdate: user.birthdate
            ? new Date(user.birthdate).toISOString().slice(0, 10)
            : null,
        gender: user.gender,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        city: user.city,
        country: user.country,
        emailVerified: user.emailVerified,
        role: user.role,
        isPremium: user.isPremium,
        superLikesRemaining: user.superLikesRemaining,
    };
}
function toPublicUserDto(user) {
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        city: user.city,
        isPremium: user.isPremium,
    };
}
//# sourceMappingURL=me.dto.js.map