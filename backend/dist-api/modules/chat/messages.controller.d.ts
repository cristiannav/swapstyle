import { ChatService } from './chat.service';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class MessagesController {
    private readonly chat;
    constructor(chat: ChatService);
    list(user: JwtPayload, matchId: string, limit?: string, before?: string): Promise<import("./entities/message.entity").Message[]>;
}
