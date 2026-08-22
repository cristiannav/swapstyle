import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  GarmentCategory,
  GarmentCondition,
} from '../entities/garment.entity';

export class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => String)
  @IsArray()
  @IsEnum(GarmentCategory, { each: true })
  category?: GarmentCategory[];

  @IsOptional()
  @IsEnum(GarmentCondition)
  minCondition?: GarmentCondition;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
