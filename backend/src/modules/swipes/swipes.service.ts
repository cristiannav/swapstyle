import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Swipe, SwipeAction } from './entities/swipe.entity';
import { Garment, GarmentStatus } from '../garments/entities/garment.entity';
import { Match, MatchStatus } from '../matches/entities/match.entity';
import { User } from '../users/entities/user.entity';
import { CreateSwipeDto } from './dto/create-swipe.dto';

export interface SwipeResult {
  matched: boolean;
  match: Match | null;
}

@Injectable()
export class SwipesService {
  constructor(
    @InjectRepository(Swipe) private readonly swipes: Repository<Swipe>,
    @InjectRepository(Garment) private readonly garments: Repository<Garment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Match) private readonly matches: Repository<Match>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateSwipeDto): Promise<SwipeResult> {
    const targetGarment = await this.garments.findOne({ where: { id: dto.garmentId } });
    if (!targetGarment) throw new NotFoundException('Prenda no encontrada');
    if (targetGarment.ownerId === userId) {
      throw new BadRequestException('No podés swipear tu propia prenda');
    }
    if (targetGarment.status !== GarmentStatus.AVAILABLE) {
      throw new BadRequestException('Esta prenda ya no está disponible');
    }

    if (dto.action === SwipeAction.SUPER_LIKE) {
      const user = await this.users.findOneOrFail({ where: { id: userId } });
      if (user.superLikesRemaining <= 0) {
        throw new BadRequestException('No tenés Super Likes disponibles');
      }
    }

    return this.dataSource.transaction(async (em) => {
      try {
        await em.save(
          em.create(Swipe, {
            userId,
            garmentId: dto.garmentId,
            action: dto.action,
          }),
        );
      } catch (error: unknown) {
        const code = (error as { code?: string }).code;
        if (code === '23505') throw new ConflictException('Ya swipeaste esta prenda');
        throw error;
      }

      if (dto.action === SwipeAction.SUPER_LIKE) {
        await em.decrement(User, { id: userId }, 'superLikesRemaining', 1);
      }

      if (dto.action === SwipeAction.PASS) {
        return { matched: false, match: null };
      }

      // Detección de match: ¿el dueño de la prenda swipeó alguna prenda mía con like/super-like?
      const reciprocalSwipe = await em
        .createQueryBuilder(Swipe, 's')
        .innerJoin(Garment, 'g', 'g.id = s.garment_id')
        .where('s.user_id = :ownerId', { ownerId: targetGarment.ownerId })
        .andWhere('g.owner_id = :userId', { userId })
        .andWhere('s.action IN (:...likeActions)', {
          likeActions: [SwipeAction.LIKE, SwipeAction.SUPER_LIKE],
        })
        .orderBy('s.created_at', 'DESC')
        .getOne();

      if (!reciprocalSwipe) return { matched: false, match: null };

      // Orden canónico para la unique constraint
      const [garmentAId, garmentBId, userAId, userBId] =
        reciprocalSwipe.garmentId < targetGarment.id
          ? [reciprocalSwipe.garmentId, targetGarment.id, targetGarment.ownerId, userId]
          : [targetGarment.id, reciprocalSwipe.garmentId, userId, targetGarment.ownerId];

      const existing = await em.findOne(Match, {
        where: { garmentAId, garmentBId },
      });
      if (existing) return { matched: true, match: existing };

      const match = await em.save(
        em.create(Match, {
          userAId,
          userBId,
          garmentAId,
          garmentBId,
          status: MatchStatus.ACTIVE,
        }),
      );

      const fullMatch = await em.findOneOrFail(Match, {
        where: { id: match.id },
        relations: { userA: true, userB: true, garmentA: { images: true }, garmentB: { images: true } },
      });

      return { matched: true, match: fullMatch };
    });
  }
}
