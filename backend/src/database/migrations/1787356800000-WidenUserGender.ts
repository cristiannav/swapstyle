import { MigrationInterface, QueryRunner } from 'typeorm';

/** `prefer_not_to_say` son 17 caracteres y la columna era varchar(16): el
 *  select de profile/edit fallaba con "value too long" al guardar. */
export class WidenUserGender1787356800000 implements MigrationInterface {
  name = 'WidenUserGender1787356800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" TYPE varchar(32)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "gender" TYPE varchar(16)`);
  }
}
