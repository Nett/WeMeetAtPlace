import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { UserCreateDto, UserLoginDto } from '@app/contracts';
import { NATS_CLIENT, NATS_TIMEOUT, NATS_CREATE_USER_PATTERN, NATS_LOGIN_USER_PATTERN } from '@app/nats';
import { AppService } from '../app.service';

@Controller('user')
export class UserController {
  constructor(@Inject(NATS_CLIENT) private readonly natsClient: ClientProxy, private readonly appService: AppService) {}

  @Post('signup')
  async create(@Body() dto: UserCreateDto) {
    const result = await firstValueFrom(
      this.natsClient.send(NATS_CREATE_USER_PATTERN, dto).pipe(timeout(NATS_TIMEOUT))
    );

    return this.appService.handleNatsResponse(result);
  }
  //@todo: add user login endpoint and ACL

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    const result = await firstValueFrom(
      this.natsClient.send(NATS_LOGIN_USER_PATTERN, dto).pipe(timeout(NATS_TIMEOUT))
    );
    return this.appService.handleNatsResponse(result);
  }
}
