import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { toGarmentDto } from './dto/garment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@ApiBearerAuth()
@ApiTags('garments')
@Controller('garments')
export class GarmentsController {
  constructor(private readonly garments: GarmentsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateGarmentDto) {
    return this.garments.create(user.sub, dto);
  }

  @Get('feed')
  feed(@CurrentUser() user: JwtPayload, @Query() query: FeedQueryDto) {
    return this.garments.feed(user.sub, query);
  }

  @Get('me')
  mine(@CurrentUser() user: JwtPayload) {
    return this.garments.findByOwner(user.sub);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return toGarmentDto(await this.garments.findOne(id));
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGarmentDto,
  ) {
    return toGarmentDto(await this.garments.update(id, user.sub, dto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.garments.remove(id, user.sub);
  }
}
