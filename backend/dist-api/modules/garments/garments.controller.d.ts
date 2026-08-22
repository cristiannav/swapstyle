import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class GarmentsController {
    private readonly garments;
    constructor(garments: GarmentsService);
    create(user: JwtPayload, dto: CreateGarmentDto): Promise<import("./entities/garment.entity").Garment>;
    feed(user: JwtPayload, query: FeedQueryDto): Promise<import("./garments.service").FeedResult>;
    mine(user: JwtPayload): Promise<import("./entities/garment.entity").Garment[]>;
    findOne(id: string): Promise<import("./dto/garment.dto").GarmentDto>;
    update(user: JwtPayload, id: string, dto: UpdateGarmentDto): Promise<import("./dto/garment.dto").GarmentDto>;
    remove(user: JwtPayload, id: string): Promise<void>;
}
