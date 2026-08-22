import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwipesService } from './swipes.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@ApiBearerAuth()
@ApiTags('swipes')
@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipes: SwipesService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSwipeDto) {
    return this.swipes.create(user.sub, dto);
  }
}
