import { BadRequestException, Body, ConflictException, Controller, Inject, InternalServerErrorException, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, CREATE_USER_PATTERN } from '@app/contracts';
import { NATS_CLIENT } from '@app/nats';

@Controller('user')
export class UserController {
  constructor(@Inject(NATS_CLIENT) private readonly natsClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const result = await firstValueFrom(this.natsClient.send(CREATE_USER_PATTERN, dto));
console.log('Result', result);
    if (!result?.ok) {
      switch (result?.error?.code) {
        case 'VALIDATION':
          throw new BadRequestException(result.error);
        case 'CONFLICT':
          throw new ConflictException(result.error);
        default:
          throw new InternalServerErrorException(result?.error ?? 'Unknown error');
      }
    }

    return result.data;

  }
}
