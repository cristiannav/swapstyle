import { Column, Entity, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Garment } from '../../garments/entities/garment.entity';

export enum MatchStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('matches')
@Unique('UQ_match_garments', ['garmentAId', 'garmentBId'])
@Index(['userAId', 'status'])
@Index(['userBId', 'status'])
export class Match extends BaseEntity {
  @Column({ name: 'user_a_id', type: 'uuid' })
  userAId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_a_id' })
  userA!: User;

  @Column({ name: 'user_b_id', type: 'uuid' })
  userBId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_b_id' })
  userB!: User;

  @Column({ name: 'garment_a_id', type: 'uuid' })
  garmentAId!: string;

  @ManyToOne(() => Garment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garment_a_id' })
  garmentA!: Garment;

  @Column({ name: 'garment_b_id', type: 'uuid' })
  garmentBId!: string;

  @ManyToOne(() => Garment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garment_b_id' })
  garmentB!: Garment;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.ACTIVE })
  status!: MatchStatus;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt!: Date | null;
}
