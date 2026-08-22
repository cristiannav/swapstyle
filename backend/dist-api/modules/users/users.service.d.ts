import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly users;
    constructor(users: Repository<User>);
    findById(id: string): Promise<User>;
    findByUsername(username: string): Promise<User>;
    updateProfile(id: string, dto: UpdateProfileDto): Promise<User>;
    deleteAccount(id: string): Promise<void>;
}
