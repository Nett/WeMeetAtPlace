import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NatsEnv } from './nats.config';
import { NatsService } from './nats.service';
import { NATS_CLIENT } from './nats.constant';

@Module({
  imports: [ConfigModule.forFeature(NatsEnv)],
  providers: [
    {
      provide: NATS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<{ url: string }>('NatsEnv');
        if (!config) throw new Error('NatsEnv configuration is required');
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: { servers: [config.url] },
        });
      },
      inject: [ConfigService],
    },
    NatsService
  ],
  exports: [NATS_CLIENT, NatsService],
})
export class NatsModule {}
