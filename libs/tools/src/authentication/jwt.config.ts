import { registerAs } from '@nestjs/config';

export const JwtEnv = registerAs('JwtEnv', () => ({
  secret: process.env.JWT_AUTH_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
}));
