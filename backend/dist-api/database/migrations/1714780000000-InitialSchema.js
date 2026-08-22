"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1714780000000 = void 0;
class InitialSchema1714780000000 {
    name = 'InitialSchema1714780000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "citext"`);
        await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin');
    `);
        await queryRunner.query(`
      CREATE TYPE "auth_provider_enum" AS ENUM ('local', 'google', 'facebook');
    `);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" citext NOT NULL,
        "password_hash" text,
        "name" varchar(80) NOT NULL,
        "username" varchar(40) NOT NULL,
        "birthdate" date,
        "gender" varchar(16),
        "bio" text,
        "avatar_url" text,
        "city" varchar(80),
        "country" varchar(80),
        "email_verified" boolean NOT NULL DEFAULT false,
        "role" "user_role_enum" NOT NULL DEFAULT 'user',
        "auth_provider" "auth_provider_enum" NOT NULL DEFAULT 'local',
        "provider_id" varchar(200),
        "is_premium" boolean NOT NULL DEFAULT false,
        "super_likes_remaining" int NOT NULL DEFAULT 1,
        "last_login_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username")`);
        await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" text NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked" boolean NOT NULL DEFAULT false,
        "user_agent" text,
        "ip_address" varchar(64),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user" ON "refresh_tokens" ("user_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_refresh_tokens_hash" ON "refresh_tokens" ("token_hash")`);
        await queryRunner.query(`
      CREATE TYPE "verification_purpose_enum" AS ENUM ('email_verification', 'password_reset');
    `);
        await queryRunner.query(`
      CREATE TABLE "verification_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" text NOT NULL,
        "purpose" "verification_purpose_enum" NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "used_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_verification_user" ON "verification_tokens" ("user_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_verification_hash" ON "verification_tokens" ("token_hash")`);
        await queryRunner.query(`
      CREATE TYPE "garment_category_enum" AS ENUM ('top','bottom','dress','outerwear','shoes','accessory','bag','other');
    `);
        await queryRunner.query(`
      CREATE TYPE "garment_condition_enum" AS ENUM ('new','like_new','good','fair');
    `);
        await queryRunner.query(`
      CREATE TYPE "garment_status_enum" AS ENUM ('available','reserved','swapped','hidden');
    `);
        await queryRunner.query(`
      CREATE TABLE "garments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar(120) NOT NULL,
        "description" text,
        "category" "garment_category_enum" NOT NULL,
        "brand" varchar(60),
        "size" varchar(16),
        "color" varchar(32),
        "condition" "garment_condition_enum" NOT NULL,
        "status" "garment_status_enum" NOT NULL DEFAULT 'available',
        "is_premium" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_garments_owner_status" ON "garments" ("owner_id","status")`);
        await queryRunner.query(`CREATE INDEX "IDX_garments_category_status" ON "garments" ("category","status")`);
        await queryRunner.query(`
      CREATE TABLE "garment_images" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "garment_id" uuid NOT NULL REFERENCES "garments"("id") ON DELETE CASCADE,
        "url" text NOT NULL,
        "position" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_garment_images_garment" ON "garment_images" ("garment_id")`);
        await queryRunner.query(`
      CREATE TYPE "swipe_action_enum" AS ENUM ('like','pass','super_like');
    `);
        await queryRunner.query(`
      CREATE TABLE "swipes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "garment_id" uuid NOT NULL REFERENCES "garments"("id") ON DELETE CASCADE,
        "action" "swipe_action_enum" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_swipe_user_garment" UNIQUE ("user_id","garment_id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_swipes_garment_action" ON "swipes" ("garment_id","action")`);
        await queryRunner.query(`
      CREATE TYPE "match_status_enum" AS ENUM ('active','archived','completed','canceled');
    `);
        await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_a_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "user_b_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "garment_a_id" uuid NOT NULL REFERENCES "garments"("id") ON DELETE CASCADE,
        "garment_b_id" uuid NOT NULL REFERENCES "garments"("id") ON DELETE CASCADE,
        "status" "match_status_enum" NOT NULL DEFAULT 'active',
        "last_message_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_match_garments" UNIQUE ("garment_a_id","garment_b_id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_matches_user_a_status" ON "matches" ("user_a_id","status")`);
        await queryRunner.query(`CREATE INDEX "IDX_matches_user_b_status" ON "matches" ("user_b_id","status")`);
        await queryRunner.query(`
      CREATE TYPE "message_type_enum" AS ENUM ('text','system','image');
    `);
        await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" uuid NOT NULL REFERENCES "matches"("id") ON DELETE CASCADE,
        "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" "message_type_enum" NOT NULL DEFAULT 'text',
        "content" text NOT NULL,
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_messages_match_created" ON "messages" ("match_id","created_at")`);
        await queryRunner.query(`
      CREATE TYPE "event_status_enum" AS ENUM ('scheduled','live','ended','canceled');
    `);
        await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(120) NOT NULL,
        "description" text,
        "host_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "starts_at" timestamptz NOT NULL,
        "ends_at" timestamptz NOT NULL,
        "max_participants" int NOT NULL DEFAULT 50,
        "status" "event_status_enum" NOT NULL DEFAULT 'scheduled',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_events_starts_status" ON "events" ("starts_at","status")`);
        await queryRunner.query(`
      CREATE TABLE "event_participants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "joined_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_event_user" UNIQUE ("event_id","user_id")
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "event_participants"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "message_type_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "matches"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "match_status_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "swipes"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "swipe_action_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "garment_images"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "garments"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "garment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "garment_condition_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "garment_category_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "verification_tokens"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "verification_purpose_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "auth_provider_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    }
}
exports.InitialSchema1714780000000 = InitialSchema1714780000000;
//# sourceMappingURL=1714780000000-InitialSchema.js.map