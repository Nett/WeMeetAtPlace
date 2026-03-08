import { registerAs } from '@nestjs/config';

export const NatsEnv = registerAs('NatsEnv', () => ({
  url: process.env.NATS_URL ?? 'nats://localhost:4222',
}));
