import { Column, Entity, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { EventParticipant } from './event-participant.entity';

export enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELED = 'canceled',
}

@Entity('events')
@Index(['startsAt', 'status'])
export class SwapEvent extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'host_id', type: 'uuid' })
  hostId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host!: User;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ name: 'max_participants', type: 'int', default: 50 })
  maxParticipants!: number;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status!: EventStatus;

  @OneToMany(() => EventParticipant, (p) => p.event)
  participants!: EventParticipant[];
}
