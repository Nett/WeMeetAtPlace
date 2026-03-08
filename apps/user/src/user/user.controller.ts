import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto, CREATE_USER_PATTERN } from '@app/contracts';

@Controller()
export class UserController {
  @MessagePattern(CREATE_USER_PATTERN)
  async create(@Payload() payload: unknown) {
    const dto = plainToInstance(CreateUserDto, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      throw new BadRequestException(`Validation failed: ${messages.join(', ')}`);
    }

    // TODO: create user in DB
    return { id: 1, ...dto };
  }
}
