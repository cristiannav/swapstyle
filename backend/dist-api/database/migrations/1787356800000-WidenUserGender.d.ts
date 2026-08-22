import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class WidenUserGender1787356800000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
