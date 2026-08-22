import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  GarmentCategory,
  GarmentCondition,
} from '../entities/garment.entity';

export class CreateGarmentDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(GarmentCategory)
  category!: GarmentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  size?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  color?: string;

  @IsEnum(GarmentCondition)
  condition!: GarmentCondition;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsUrl({ require_protocol: true }, { each: true })
  imageUrls!: string[];
}
