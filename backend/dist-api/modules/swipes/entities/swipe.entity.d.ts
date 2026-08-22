import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Garment } from '../../garments/entities/garment.entity';
export declare enum SwipeAction {
    LIKE = "like",
    PASS = "pass",
    SUPER_LIKE = "super_like"
}
export declare class Swipe extends BaseEntity {
    userId: string;
    user: User;
    garmentId: string;
    garment: Garment;
    action: SwipeAction;
}
