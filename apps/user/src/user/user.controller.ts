import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UserCreateDto, NatsResult, UserProfileDto, UserLoginDto } from '@app/contracts';
import { NATS_CREATE_USER_PATTERN, NATS_LOGIN_USER_PATTERN } from '@app/nats';
import { UserService } from './user.service';
import { NatsValidationPipe } from '@app/tools';

@UsePipes(NatsValidationPipe)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(NATS_CREATE_USER_PATTERN)
  async create(@Payload() payload: UserCreateDto): Promise<NatsResult<UserProfileDto>> {
    try {
      return await this.userService.add(payload);
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL', message: error?.message ?? 'Unknown error while creating a user' },
      };
    }
  }

  @MessagePattern(NATS_LOGIN_USER_PATTERN)
  async login(@Payload() payload: UserLoginDto): Promise<NatsResult<UserProfileDto>> {
    return await this.userService.login(payload);
  }
}
