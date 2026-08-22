import { Repository } from 'typeorm';
import { SwapEvent } from './entities/event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { CreateEventDto } from './dto/create-event.dto';
export declare class EventsService {
    private readonly events;
    private readonly participants;
    constructor(events: Repository<SwapEvent>, participants: Repository<EventParticipant>);
    create(hostId: string, dto: CreateEventDto): Promise<SwapEvent>;
    listUpcoming(): Promise<SwapEvent[]>;
    findOne(id: string): Promise<SwapEvent>;
    join(eventId: string, userId: string): Promise<EventParticipant>;
    leave(eventId: string, userId: string): Promise<void>;
    cancel(eventId: string, userId: string): Promise<SwapEvent>;
}
