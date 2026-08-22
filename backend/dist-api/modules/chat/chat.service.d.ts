import { Repository } from 'typeorm';
import { Message, MessageType } from './entities/message.entity';
import { Match } from '../matches/entities/match.entity';
export declare class ChatService {
    private readonly messages;
    private readonly matches;
    constructor(messages: Repository<Message>, matches: Repository<Match>);
    assertParticipant(matchId: string, userId: string): Promise<Match>;
    listMessages(matchId: string, userId: string, options?: {
        limit?: number;
        before?: string;
    }): Promise<Message[]>;
    createMessage(matchId: string, senderId: string, content: string, type?: MessageType): Promise<Message>;
    markAsRead(matchId: string, userId: string, messageIds: string[]): Promise<void>;
}
