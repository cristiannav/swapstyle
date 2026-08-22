import { IsEnum, IsUUID } from 'class-validator';
import { SwipeAction } from '../entities/swipe.entity';

export class CreateSwipeDto {
  @IsUUID()
  garmentId!: string;

  @IsEnum(SwipeAction)
  action!: SwipeAction;
}
