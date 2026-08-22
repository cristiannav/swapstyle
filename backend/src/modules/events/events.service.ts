import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SwapEvent, EventStatus } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(SwapEvent) private readonly events: Repository<SwapEvent>,
    @InjectRepository(EventParticipant)
    private readonly participants: Repository<EventParticipant>,
  ) {}

  async create(hostId: string, dto: CreateEventDto): Promise<SwapEvent> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt debe ser posterior a startsAt');
    }
    if (startsAt < new Date()) {
      throw new BadRequestException('No se pueden crear eventos en el pasado');
    }
    const event = this.events.create({
      hostId,
      title: dto.title,
      description: dto.description ?? null,
      startsAt,
      endsAt,
      maxParticipants: dto.maxParticipants ?? 50,
      status: EventStatus.SCHEDULED,
    });
    return this.events.save(event);
  }

  async listUpcoming(): Promise<SwapEvent[]> {
    return this.events.find({
      where: { status: EventStatus.SCHEDULED, startsAt: MoreThan(new Date()) },
      relations: { host: true, participants: { user: true } },
      order: { startsAt: 'ASC' },
      take: 50,
    });
  }

  async findOne(id: string): Promise<SwapEvent> {
    const event = await this.events.findOne({
      where: { id },
      relations: { host: true, participants: { user: true } },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async join(eventId: string, userId: string): Promise<EventParticipant> {
    const event = await this.findOne(eventId);
    if (event.status !== EventStatus.SCHEDULED) {
      throw new BadRequestException('No podés joinearte a este evento');
    }
    if ((event.participants?.length ?? 0) >= event.maxParticipants) {
      throw new BadRequestException('El evento está completo');
    }
    try {
      return await this.participants.save(
        this.participants.create({ eventId, userId, joinedAt: new Date() }),
      );
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === '23505') throw new ConflictException('Ya estás en este evento');
      throw error;
    }
  }

  async leave(eventId: string, userId: string): Promise<void> {
    await this.participants.delete({ eventId, userId });
  }

  async cancel(eventId: string, userId: string): Promise<SwapEvent> {
    const event = await this.findOne(eventId);
    if (event.hostId !== userId) {
      throw new ForbiddenException('Solo el host puede cancelar');
    }
    event.status = EventStatus.CANCELED;
    return this.events.save(event);
  }
}
