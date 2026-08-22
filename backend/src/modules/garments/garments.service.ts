import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Garment, GarmentStatus } from './entities/garment.entity';
import { GarmentImage } from './entities/garment-image.entity';
import { Swipe } from '../swipes/entities/swipe.entity';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { GarmentDto, toGarmentDto } from './dto/garment.dto';

export interface FeedResult {
  items: GarmentDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class GarmentsService {
  constructor(
    @InjectRepository(Garment) private readonly garments: Repository<Garment>,
    @InjectRepository(GarmentImage) private readonly images: Repository<GarmentImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(ownerId: string, dto: CreateGarmentDto): Promise<Garment> {
    return this.dataSource.transaction(async (em) => {
      const garment = await em.save(
        em.create(Garment, {
          ownerId,
          title: dto.title,
          description: dto.description ?? null,
          category: dto.category,
          brand: dto.brand ?? null,
          size: dto.size ?? null,
          color: dto.color ?? null,
          condition: dto.condition,
          status: GarmentStatus.AVAILABLE,
        }),
      );

      const images = dto.imageUrls.map((url, position) =>
        em.create(GarmentImage, { garmentId: garment.id, url, position }),
      );
      await em.save(images);
      garment.images = images;
      return garment;
    });
  }

  async findOne(id: string): Promise<Garment> {
    const garment = await this.garments.findOne({
      where: { id },
      relations: { images: true, owner: true },
    });
    if (!garment) throw new NotFoundException('Prenda no encontrada');
    return garment;
  }

  async findByOwner(ownerId: string): Promise<Garment[]> {
    return this.garments.find({
      where: { ownerId },
      relations: { images: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, ownerId: string, dto: UpdateGarmentDto): Promise<Garment> {
    const garment = await this.findOne(id);
    if (garment.ownerId !== ownerId) throw new ForbiddenException('No es tu prenda');

    Object.assign(garment, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.size !== undefined && { size: dto.size }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.condition !== undefined && { condition: dto.condition }),
      ...(dto.status !== undefined && { status: dto.status }),
    });
    await this.garments.save(garment);
    return this.findOne(id);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const garment = await this.findOne(id);
    if (garment.ownerId !== ownerId) throw new ForbiddenException('No es tu prenda');
    await this.garments.delete({ id });
  }

  async feed(userId: string, query: FeedQueryDto): Promise<FeedResult> {
    const limit = query.limit ?? 20;
    const qb = this.garments
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.images', 'img')
      .leftJoinAndSelect('g.owner', 'owner')
      .where('g.status = :status', { status: GarmentStatus.AVAILABLE })
      .andWhere('g.owner_id != :userId', { userId })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM swipes s
          WHERE s.user_id = :userId AND s.garment_id = g.id
        )`,
      )
      .orderBy('g.created_at', 'DESC')
      .addOrderBy('g.id', 'DESC')
      .limit(limit + 1);

    if (query.cursor) {
      const decoded = this.decodeCursor(query.cursor);
      if (decoded) {
        qb.andWhere(
          '(g.created_at, g.id) < (:cursorDate, :cursorId)',
          { cursorDate: decoded.createdAt, cursorId: decoded.id },
        );
      }
    }

    if (query.category?.length) {
      qb.andWhere('g.category IN (:...categories)', { categories: query.category });
    }
    if (query.size) {
      qb.andWhere('g.size = :size', { size: query.size });
    }
    if (query.city) {
      qb.andWhere('LOWER(owner.city) = LOWER(:city)', { city: query.city });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items[items.length - 1];
    const nextCursor = hasMore && last
      ? this.encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id })
      : null;

    return { items: items.map(toGarmentDto), nextCursor, hasMore };
  }

  private encodeCursor(c: { createdAt: string; id: string }): string {
    return Buffer.from(JSON.stringify(c)).toString('base64url');
  }

  private decodeCursor(cursor: string): { createdAt: string; id: string } | null {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    } catch {
      return null;
    }
  }
}
