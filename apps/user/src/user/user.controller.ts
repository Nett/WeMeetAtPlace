import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserCreateDto, NatsResult, UserProfileDto, UserLoginDto } from '@app/contracts';
import { NATS_CREATE_USER_PATTERN, NATS_LOGIN_USER_PATTERN } from '@app/nats';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(NATS_CREATE_USER_PATTERN)
  async create(@Payload() payload: UserCreateDto): Promise<NatsResult<UserProfileDto>> {
    const dto = plainToInstance(UserCreateDto, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return { ok: false, error: { code: 'VALIDATION', message: `Validation failed: ${messages.join(', ')}` } };
    }

    try {
      return await this.userService.add(dto);
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL', message: error?.message ?? 'Unknown error while creating a user' },
      };
    }
  }

  @MessagePattern(NATS_LOGIN_USER_PATTERN)
  async login(@Payload() payload: UserLoginDto): Promise<NatsResult<UserProfileDto>> {
    const dto = plainToInstance(UserLoginDto, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return { ok: false, error: { code: 'VALIDATION', message: `Validation failed: ${messages.join(', ')}` } };
    }

    return await this.userService.login(dto);
  }
}
