import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from '@app/contracts';
import { NATS_CREATE_USER_PATTERN } from '@app/nats';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(NATS_CREATE_USER_PATTERN)
  async create(@Payload() payload: unknown) {
    const dto = plainToInstance(CreateUserDto, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return { ok: false, error: { code: 'VALIDATION', message: `Validation failed: ${messages.join(', ')}` } };
    }

    try {
      console.log("Adding user");
      const res = await this.userService.add(dto);
      console.log('Result', res);
      return res;
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL', message: error?.message ?? 'Unknown error' },
      };
    }
  }
}
