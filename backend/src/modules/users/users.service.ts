import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  findById(id: string): Promise<User> {
    return this.users.findOneOrFail({ where: { id } }).catch(() => {
      throw new NotFoundException('Usuario no encontrado');
    });
  }

  findByUsername(username: string): Promise<User> {
    return this.users.findOneOrFail({ where: { username } }).catch(() => {
      throw new NotFoundException('Usuario no encontrado');
    });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.country !== undefined && { country: dto.country }),
      ...(dto.birthdate !== undefined && {
        birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
      }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
    });
    return this.users.save(user);
  }

  async deleteAccount(id: string): Promise<void> {
    await this.users.delete({ id });
  }
}
