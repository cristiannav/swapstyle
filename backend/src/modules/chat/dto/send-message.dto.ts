import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @IsUUID()
  matchId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}

export class JoinChatDto {
  @IsUUID()
  matchId!: string;
}

export class ReadChatDto {
  @IsUUID()
  matchId!: string;

  @IsUUID('4', { each: true })
  messageIds!: string[];
}
