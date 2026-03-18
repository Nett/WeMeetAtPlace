import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto, NatsResult, UserProfileDto, UserLoginDto } from '@app/contracts';
import { PasswordService } from '@app/tools';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async add(dto: UserCreateDto): Promise<NatsResult<UserProfileDto>> {
    const existingUser = await this.findByEmailOrNickname(dto.email, dto.nickname);

    if (existingUser?.email === dto.email) {
      return { ok: false, error: { code: 'CONFLICT', message: 'validation.user_email_duplicate' } };
    }
    if (existingUser?.nickname === dto.nickname) {
      return { ok: false, error: { code: 'CONFLICT', message: 'validation.user_nickname_duplicate' } };
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    const user = this.userRepository.create({
      nickname: dto.nickname,
      email: dto.email,
      password: hashedPassword,
    });
    
    const result = await this.userRepository.save(user);
    const userProfile = await this.findById(result.id);

    if(userProfile === null) {
      throw new Error('Unable to create user');
    }

    return { ok: true, data:  userProfile};
  }

  async login(user: UserLoginDto): Promise<NatsResult<UserProfileDto>> {
    const userPassAndId = await this.userRepository.findOne({ where: {nickname: user.nickname}, select: { id: true, password: true } });

    if(userPassAndId === null) {
      return {ok: false, error: { code: 'NOT_FOUND', message: 'validation.user_nickname_or_pass_incorrect' }}
    }

    const passIsCorrect = await this.passwordService.verify(userPassAndId.password, user.password);

    if(!passIsCorrect) {
      return {ok: false, error: { code: 'NOT_FOUND', message: 'validation.user_nickname_or_pass_incorrect' }}
    }

    return {ok: true, data: await this.findById(userPassAndId.id) as unknown as UserProfileDto };
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

  async findById(id: number): Promise<UserProfileDto | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
