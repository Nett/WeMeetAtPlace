import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '@app/contracts';
import { PasswordService } from '@app/tools';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async add(dto: CreateUserDto) {
    console.log('dto', dto);
    const existingUser = await this.findByEmailOrNickname(dto.email, dto.nickname);
console.log('ExistingUser', existingUser);

    if (existingUser?.email === dto.email) {
      return { ok: false, error: { code: 'CONFLICT', message: 'User with this email already exists' } };
    }
    if (existingUser?.nickname === dto.nickname) {
      return { ok: false, error: { code: 'CONFLICT', message: 'User with this nickname already exists' } };
    }

    const hashedPassword = await this.passwordService.hash(dto.password);
    console.log('hashedPassword', hashedPassword);
    const user = this.userRepository.create({
      nickname: dto.nickname,
      email: dto.email,
      password: hashedPassword,
    });
    
    const result = await this.userRepository.save(user);

    return { ok: true, data: await this.findById(result.id) };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByNickname(nickname: string) {
    return this.userRepository.findOne({ where: { nickname } });
  }

  async findByEmailOrNickname(email: string, nickname: string) {
    return this.userRepository.findOne({ where: [{ email }, { nickname }] });
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
