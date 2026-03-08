import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, CREATE_USER_PATTERN } from '@app/contracts';
import { NATS_CLIENT } from '@app/nats';

@Controller('api/users')
export class UserController {
  constructor(@Inject(NATS_CLIENT) private readonly natsClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.natsClient.send(CREATE_USER_PATTERN, dto).toPromise();
  }
}
