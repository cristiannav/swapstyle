import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { toMeDto, toPublicUserDto } from './dto/me.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() current: JwtPayload) {
    const user = await this.users.findById(current.sub);
    return toMeDto(user);
  }

  @Patch('me')
  async updateMe(@CurrentUser() current: JwtPayload, @Body() dto: UpdateProfileDto) {
    const user = await this.users.updateProfile(current.sub, dto);
    return toMeDto(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('me')
  deleteMe(@CurrentUser() current: JwtPayload) {
    return this.users.deleteAccount(current.sub);
  }

  @Get(':username')
  async byUsername(@Param('username') username: string) {
    const user = await this.users.findByUsername(username);
    return toPublicUserDto(user);
  }
}
