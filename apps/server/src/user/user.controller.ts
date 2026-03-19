import { Body, Controller, Inject, Post } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { NatsResult, UserCreateDto, UserLoginDto, UserProfileDto } from '@app/contracts';
import { NATS_TIMEOUT, NATS_CREATE_USER_PATTERN, NATS_LOGIN_USER_PATTERN } from '@app/nats';
import { AppService } from '../app.service';
import { NatsService } from '@app/nats/nats.service';

@Controller('user')
export class UserController {
  constructor(private readonly natsService: NatsService, private readonly appService: AppService) {}

  @Post('signup')
  async create(@Body() dto: UserCreateDto) {
    const result = await this.natsService.sendRequest<NatsResult<UserProfileDto>, UserCreateDto>(NATS_CREATE_USER_PATTERN, dto);
    return this.appService.handleNatsResponse(result);
  }
  //@todo: add user login endpoint and ACL

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    const result = await this.natsService.sendRequest<NatsResult<UserProfileDto>, UserLoginDto>(NATS_LOGIN_USER_PATTERN, dto);
    return this.appService.handleNatsResponse(result);
  }
}
