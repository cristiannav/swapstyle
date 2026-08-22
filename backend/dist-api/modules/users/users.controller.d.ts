import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(current: JwtPayload): Promise<import("./dto/me.dto").MeDto>;
    updateMe(current: JwtPayload, dto: UpdateProfileDto): Promise<import("./dto/me.dto").MeDto>;
    deleteMe(current: JwtPayload): Promise<void>;
    byUsername(username: string): Promise<import("./dto/me.dto").PublicUserDto>;
}
