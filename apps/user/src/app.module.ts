import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsEnv, NatsEnvValidationSchema } from '@app/nats';
import { PostgresEnvValidationSchema, PostgresModule } from '@app/postgres';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forFeature(NatsEnv),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: ['production', 'staging'].includes(process.env.NODE_ENV || ''),
      envFilePath: join(process.cwd(), 'apps', 'user', '.env'),
      validationSchema: PostgresEnvValidationSchema.concat(NatsEnvValidationSchema),
    }),
    PostgresModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
