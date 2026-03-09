import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).get<{ url: string }>('NatsEnv');
  if (!config) throw new Error('NatsEnv configuration is required');

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: { servers: [config.url] },
  });
  await app.startAllMicroservices();
}

bootstrap();
