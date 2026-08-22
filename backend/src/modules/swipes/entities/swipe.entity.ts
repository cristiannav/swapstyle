import { Column, Entity, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Garment } from '../../garments/entities/garment.entity';

export enum SwipeAction {
  LIKE = 'like',
  PASS = 'pass',
  SUPER_LIKE = 'super_like',
}

@Entity('swipes')
@Unique('UQ_swipe_user_garment', ['userId', 'garmentId'])
@Index(['garmentId', 'action'])
export class Swipe extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'garment_id', type: 'uuid' })
  garmentId!: string;

  @ManyToOne(() => Garment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garment_id' })
  garment!: Garment;

  @Column({ type: 'enum', enum: SwipeAction })
  action!: SwipeAction;
}
