import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { EventParticipant } from './event-participant.entity';
export declare enum EventStatus {
    SCHEDULED = "scheduled",
    LIVE = "live",
    ENDED = "ended",
    CANCELED = "canceled"
}
export declare class SwapEvent extends BaseEntity {
    title: string;
    description: string | null;
    hostId: string;
    host: User;
    startsAt: Date;
    endsAt: Date;
    maxParticipants: number;
    status: EventStatus;
    participants: EventParticipant[];
}
