import { CreateGarmentDto } from './create-garment.dto';
import { GarmentStatus } from '../entities/garment.entity';
declare const UpdateGarmentDto_base: import("@nestjs/common").Type<Partial<Omit<CreateGarmentDto, "imageUrls">>>;
export declare class UpdateGarmentDto extends UpdateGarmentDto_base {
    status?: GarmentStatus;
}
export {};
