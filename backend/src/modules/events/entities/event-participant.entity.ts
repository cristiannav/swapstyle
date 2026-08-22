import { Column, Entity, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { SwapEvent } from './event.entity';

@Entity('event_participants')
@Unique('UQ_event_user', ['eventId', 'userId'])
export class EventParticipant extends BaseEntity {
  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @ManyToOne(() => SwapEvent, (e) => e.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: SwapEvent;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'joined_at', type: 'timestamptz' })
  joinedAt!: Date;
}
