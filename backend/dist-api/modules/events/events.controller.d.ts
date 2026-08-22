import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class EventsController {
    private readonly events;
    constructor(events: EventsService);
    list(): Promise<import("./entities/event.entity").SwapEvent[]>;
    detail(id: string): Promise<import("./entities/event.entity").SwapEvent>;
    create(user: JwtPayload, dto: CreateEventDto): Promise<import("./entities/event.entity").SwapEvent>;
    join(user: JwtPayload, id: string): Promise<import("./entities/event-participant.entity").EventParticipant>;
    leave(user: JwtPayload, id: string): Promise<void>;
    cancel(user: JwtPayload, id: string): Promise<import("./entities/event.entity").SwapEvent>;
}
