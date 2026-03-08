import { Module } from '@nestjs/common';
import { NatsModule } from '@app/nats';
import { UserController } from './user.controller';

@Module({
  imports: [NatsModule],
  controllers: [UserController],
})
export class UserModule {}
