import { PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateGarmentDto } from './create-garment.dto';
import { GarmentStatus } from '../entities/garment.entity';

export class UpdateGarmentDto extends PartialType(
  OmitType(CreateGarmentDto, ['imageUrls'] as const),
) {
  @IsOptional()
  @IsEnum(GarmentStatus)
  status?: GarmentStatus;
}
