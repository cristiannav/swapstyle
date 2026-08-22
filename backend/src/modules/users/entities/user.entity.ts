import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../database/base.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'citext' })
  email!: string;

  // Never serialize the credential hash. Combined with the global
  // ClassSerializerInterceptor this strips passwordHash from ANY response that
  // returns a User entity (feed owner, matches userA/userB, chat sender, ...).
  @Exclude()
  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  username!: string;

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  gender!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  country!: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    name: 'auth_provider',
  })
  authProvider!: AuthProvider;

  @Column({ name: 'provider_id', type: 'varchar', length: 200, nullable: true })
  providerId!: string | null;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium!: boolean;

  @Column({ name: 'super_likes_remaining', type: 'int', default: 1 })
  superLikesRemaining!: number;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;
}
