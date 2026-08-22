import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@ApiBearerAuth()
@ApiTags('messages')
@Controller('matches/:matchId/messages')
export class MessagesController {
  constructor(private readonly chat: ChatService) {}

  @Get()
  list(
    @CurrentUser() user: JwtPayload,
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chat.listMessages(matchId, user.sub, {
      limit: limit ? parseInt(limit, 10) : undefined,
      before,
    });
  }
}
