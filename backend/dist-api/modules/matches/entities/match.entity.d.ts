import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Garment } from '../../garments/entities/garment.entity';
export declare enum MatchStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    COMPLETED = "completed",
    CANCELED = "canceled"
}
export declare class Match extends BaseEntity {
    userAId: string;
    userA: User;
    userBId: string;
    userB: User;
    garmentAId: string;
    garmentA: Garment;
    garmentBId: string;
    garmentB: Garment;
    status: MatchStatus;
    lastMessageAt: Date | null;
}
