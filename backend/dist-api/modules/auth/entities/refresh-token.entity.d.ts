import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
export declare class RefreshToken extends BaseEntity {
    userId: string;
    user: User;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    userAgent: string | null;
    ipAddress: string | null;
}
