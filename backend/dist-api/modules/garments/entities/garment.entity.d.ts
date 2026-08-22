import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { GarmentImage } from './garment-image.entity';
export declare enum GarmentCategory {
    TOP = "top",
    BOTTOM = "bottom",
    DRESS = "dress",
    OUTERWEAR = "outerwear",
    SHOES = "shoes",
    ACCESSORY = "accessory",
    BAG = "bag",
    OTHER = "other"
}
export declare enum GarmentCondition {
    NEW = "new",
    LIKE_NEW = "like_new",
    GOOD = "good",
    FAIR = "fair"
}
export declare enum GarmentStatus {
    AVAILABLE = "available",
    RESERVED = "reserved",
    SWAPPED = "swapped",
    HIDDEN = "hidden"
}
export declare class Garment extends BaseEntity {
    ownerId: string;
    owner: User;
    title: string;
    description: string | null;
    category: GarmentCategory;
    brand: string | null;
    size: string | null;
    color: string | null;
    condition: GarmentCondition;
    status: GarmentStatus;
    isPremium: boolean;
    images: GarmentImage[];
}
