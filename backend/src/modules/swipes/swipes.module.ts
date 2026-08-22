import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swipe } from './entities/swipe.entity';
import { SwipesService } from './swipes.service';
import { SwipesController } from './swipes.controller';
import { Garment } from '../garments/entities/garment.entity';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Swipe, Garment, User, Match])],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
