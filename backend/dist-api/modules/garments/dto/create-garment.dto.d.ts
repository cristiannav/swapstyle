import { GarmentCategory, GarmentCondition } from '../entities/garment.entity';
export declare class CreateGarmentDto {
    title: string;
    description?: string;
    category: GarmentCategory;
    brand?: string;
    size?: string;
    color?: string;
    condition: GarmentCondition;
    imageUrls: string[];
}
