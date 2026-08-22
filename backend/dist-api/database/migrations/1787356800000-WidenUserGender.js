"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidenUserGender1787356800000 = void 0;
class WidenUserGender1787356800000 {
    name = 'WidenUserGender1787356800000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" TYPE varchar(32)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" TYPE varchar(16)`);
    }
}
exports.WidenUserGender1787356800000 = WidenUserGender1787356800000;
//# sourceMappingURL=1787356800000-WidenUserGender.js.map