import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { GarmentImage } from './garment-image.entity';

export enum GarmentCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  DRESS = 'dress',
  OUTERWEAR = 'outerwear',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
  BAG = 'bag',
  OTHER = 'other',
}

export enum GarmentCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum GarmentStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SWAPPED = 'swapped',
  HIDDEN = 'hidden',
}

@Entity('garments')
@Index(['ownerId', 'status'])
@Index(['category', 'status'])
export class Garment extends BaseEntity {
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: GarmentCategory })
  category!: GarmentCategory;

  @Column({ type: 'varchar', length: 60, nullable: true })
  brand!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  color!: string | null;

  @Column({ type: 'enum', enum: GarmentCondition })
  condition!: GarmentCondition;

  @Column({ type: 'enum', enum: GarmentStatus, default: GarmentStatus.AVAILABLE })
  status!: GarmentStatus;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium!: boolean;

  @OneToMany(() => GarmentImage, (img) => img.garment, { cascade: true })
  images!: GarmentImage[];
}
