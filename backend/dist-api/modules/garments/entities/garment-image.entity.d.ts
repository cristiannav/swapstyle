import { BaseEntity } from '../../../database/base.entity';
import { Garment } from './garment.entity';
export declare class GarmentImage extends BaseEntity {
    garmentId: string;
    garment: Garment;
    url: string;
    position: number;
}
