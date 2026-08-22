import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { toMatchDto } from './dto/match.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@ApiBearerAuth()
@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.matches.findForUser(user.sub);
  }

  @Get(':id')
  async detail(@CurrentUser() user: JwtPayload, @Param('id', new ParseUUIDPipe()) id: string) {
    return toMatchDto(await this.matches.findOne(id, user.sub));
  }

  @Patch(':id/archive')
  async archive(@CurrentUser() user: JwtPayload, @Param('id', new ParseUUIDPipe()) id: string) {
    return toMatchDto(await this.matches.archive(id, user.sub));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  cancel(@CurrentUser() user: JwtPayload, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.matches.cancel(id, user.sub);
  }
}
