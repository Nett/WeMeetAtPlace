import { Module } from '@nestjs/common';
import { NatsModule } from '@app/nats';
import { UserController } from './user.controller';
import { AppService } from '../app.service';
import { NatsService } from '@app/nats/nats.service';

@Module({
  imports: [NatsModule],
  controllers: [UserController],
  providers: [AppService, NatsService],
})
export class UserModule {}
