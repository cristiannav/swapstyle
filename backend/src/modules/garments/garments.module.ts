import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Garment } from './entities/garment.entity';
import { GarmentImage } from './entities/garment-image.entity';
import { GarmentsService } from './garments.service';
import { GarmentsController } from './garments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Garment, GarmentImage])],
  controllers: [GarmentsController],
  providers: [GarmentsService],
  exports: [GarmentsService],
})
export class GarmentsModule {}
