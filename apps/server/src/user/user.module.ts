import { Module } from '@nestjs/common';
import { NatsModule } from '@app/nats';
import { UserController } from './user.controller';
import { AppService } from '../app.service';

@Module({
  imports: [NatsModule],
  controllers: [UserController],
  providers: [AppService]
})
export class UserModule {}
