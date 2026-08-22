import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
export declare enum VerificationPurpose {
    EMAIL_VERIFICATION = "email_verification",
    PASSWORD_RESET = "password_reset"
}
export declare class VerificationToken extends BaseEntity {
    userId: string;
    user: User;
    tokenHash: string;
    purpose: VerificationPurpose;
    expiresAt: Date;
    usedAt: Date | null;
}
