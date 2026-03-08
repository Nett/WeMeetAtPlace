import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresEnvValidationSchema, PostgresModule } from '@app/postgres';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: ['production', 'staging'].includes(process.env.NODE_ENV || ''),
      envFilePath: join(process.cwd(), 'apps', 'user', '.env'),
      validationSchema: PostgresEnvValidationSchema,
    }),
    PostgresModule,
    TypeOrmModule.forFeature([User]),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
