import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NATS_BUS_NAME, NATS_USER_QUEUE } from '@app/nats';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).get<{ url: string }>('NatsEnv');
  if (!config) throw new Error('NatsEnv configuration is required');

  await app.connectMicroservice<MicroserviceOptions>({

    transport: Transport.NATS,
    options: {
      name: NATS_BUS_NAME,
      servers: [config.url], 
      queue: NATS_USER_QUEUE,
      // @todo add reconnect tuning
      // reconnect tuning (optional)
      // maxReconnectAttempts: -1,
      // reconnectTimeWait: 1000,
      // timeout: 2000,
    },
  });

  await app.startAllMicroservices();
  await app.init();
}

bootstrap();
