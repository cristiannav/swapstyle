import { DataSource, Repository } from 'typeorm';
import { Garment } from './entities/garment.entity';
import { GarmentImage } from './entities/garment-image.entity';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { GarmentDto } from './dto/garment.dto';
export interface FeedResult {
    items: GarmentDto[];
    nextCursor: string | null;
    hasMore: boolean;
}
export declare class GarmentsService {
    private readonly garments;
    private readonly images;
    private readonly dataSource;
    constructor(garments: Repository<Garment>, images: Repository<GarmentImage>, dataSource: DataSource);
    create(ownerId: string, dto: CreateGarmentDto): Promise<Garment>;
    findOne(id: string): Promise<Garment>;
    findByOwner(ownerId: string): Promise<Garment[]>;
    update(id: string, ownerId: string, dto: UpdateGarmentDto): Promise<Garment>;
    remove(id: string, ownerId: string): Promise<void>;
    feed(userId: string, query: FeedQueryDto): Promise<FeedResult>;
    private encodeCursor;
    private decodeCursor;
}
