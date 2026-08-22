import { Garment } from '../entities/garment.entity';
import { PublicUserDto } from '../../users/dto/me.dto';
export type GarmentDto = Omit<Garment, 'owner'> & {
    owner?: PublicUserDto;
};
export declare function toGarmentDto(garment: Garment): GarmentDto;
