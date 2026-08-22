import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Message, MessageType } from './entities/message.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
  ) {}

  async assertParticipant(matchId: string, userId: string): Promise<Match> {
    const match = await this.matches.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match no encontrado');
    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException('No pertenecés a este match');
    }
    return match;
  }

  async listMessages(
    matchId: string,
    userId: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<Message[]> {
    await this.assertParticipant(matchId, userId);
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const where: Record<string, unknown> = { matchId };
    if (options.before) {
      where.createdAt = LessThan(new Date(options.before));
    }
    return this.messages.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async createMessage(
    matchId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
  ): Promise<Message> {
    await this.assertParticipant(matchId, senderId);
    const message = await this.messages.save(
      this.messages.create({ matchId, senderId, content, type }),
    );
    await this.matches.update({ id: matchId }, { lastMessageAt: message.createdAt });
    return message;
  }

  async markAsRead(matchId: string, userId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    await this.assertParticipant(matchId, userId);
    await this.messages
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: () => 'NOW()' })
      .where('id IN (:...ids)', { ids: messageIds })
      .andWhere('match_id = :matchId', { matchId })
      .andWhere('sender_id != :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();
  }
}
