import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { SwapEvent } from './event.entity';
export declare class EventParticipant extends BaseEntity {
    eventId: string;
    event: SwapEvent;
    userId: string;
    user: User;
    joinedAt: Date;
}
