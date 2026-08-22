import { Garment } from '../entities/garment.entity';
import { PublicUserDto, toPublicUserDto } from '../../users/dto/me.dto';

/**
 * Garment as exposed over the API: the `owner` relation is narrowed to the
 * public user shape so responses never leak other users' PII (email,
 * birthdate, role, ...). Everything else on the garment is passed through.
 */
export type GarmentDto = Omit<Garment, 'owner'> & { owner?: PublicUserDto };

export function toGarmentDto(garment: Garment): GarmentDto {
  const { owner, ...rest } = garment;
  return {
    ...rest,
    owner: owner ? toPublicUserDto(owner) : undefined,
  };
}
