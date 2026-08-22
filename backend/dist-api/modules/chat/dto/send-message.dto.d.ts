import { MessageType } from '../entities/message.entity';
export declare class SendMessageDto {
    matchId: string;
    content: string;
    type?: MessageType;
}
export declare class JoinChatDto {
    matchId: string;
}
export declare class ReadChatDto {
    matchId: string;
    messageIds: string[];
}
