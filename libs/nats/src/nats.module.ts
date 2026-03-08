import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NatsEnv } from './nats.config';

export const NATS_CLIENT = 'NATS_CLIENT';

@Module({
  imports: [ConfigModule.forFeature(NatsEnv)],
  providers: [
    {
      provide: NATS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<{ url: string }>('NatsEnv');
        const url = config?.url ?? 'nats://localhost:4222';
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: { servers: [url] },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [NATS_CLIENT],
})
export class NatsModule {}
