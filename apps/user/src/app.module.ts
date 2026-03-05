import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresEnvValidationSchema, PostgresModule } from '@app/postgres';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: ['production', 'staging'].includes(process.env.NODE_ENV || ''),
      envFilePath: join(process.cwd(), 'apps', 'user', '.env'),
      validationSchema: PostgresEnvValidationSchema,
    }),
    PostgresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
