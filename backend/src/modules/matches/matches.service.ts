import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { MatchDto, toMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(@InjectRepository(Match) private readonly matches: Repository<Match>) {}

  async findForUser(userId: string): Promise<MatchDto[]> {
    const rows = await this.matches
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.userA', 'userA')
      .leftJoinAndSelect('m.userB', 'userB')
      .leftJoinAndSelect('m.garmentA', 'garmentA')
      .leftJoinAndSelect('garmentA.images', 'gaImg')
      .leftJoinAndSelect('m.garmentB', 'garmentB')
      .leftJoinAndSelect('garmentB.images', 'gbImg')
      .where('m.status = :status', { status: MatchStatus.ACTIVE })
      .andWhere('(m.user_a_id = :userId OR m.user_b_id = :userId)', { userId })
      .orderBy('COALESCE(m.last_message_at, m.created_at)', 'DESC')
      .getMany();
    return rows.map(toMatchDto);
  }

  async findOne(id: string, userId: string): Promise<Match> {
    const match = await this.matches.findOne({
      where: { id },
      relations: {
        userA: true,
        userB: true,
        garmentA: { images: true },
        garmentB: { images: true },
      },
    });
    if (!match) throw new NotFoundException('Match no encontrado');
    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException('No tenés acceso a este match');
    }
    return match;
  }

  async archive(id: string, userId: string): Promise<Match> {
    const match = await this.findOne(id, userId);
    match.status = MatchStatus.ARCHIVED;
    return this.matches.save(match);
  }

  async cancel(id: string, userId: string): Promise<Match> {
    const match = await this.findOne(id, userId);
    match.status = MatchStatus.CANCELED;
    return this.matches.save(match);
  }
}
