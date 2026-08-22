import { GarmentCategory, GarmentCondition } from '../entities/garment.entity';
export declare class FeedQueryDto {
    limit: number;
    cursor?: string;
    category?: GarmentCategory[];
    minCondition?: GarmentCondition;
    size?: string;
    city?: string;
}
