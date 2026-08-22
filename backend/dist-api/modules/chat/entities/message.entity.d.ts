import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';
export declare enum MessageType {
    TEXT = "text",
    SYSTEM = "system",
    IMAGE = "image"
}
export declare class Message extends BaseEntity {
    matchId: string;
    match: Match;
    senderId: string;
    sender: User;
    type: MessageType;
    content: string;
    readAt: Date | null;
}
