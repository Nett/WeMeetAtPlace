import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresEnv } from './postgres.config';
import { PostgresService } from './postgres.service';

@Module({
  imports: [
    ConfigModule.forFeature(PostgresEnv),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<ReturnType<typeof PostgresEnv>>('PostgresEnv')!;
        return {
          type: 'postgres' as const,
          host: config.host,
          port: config.port ? parseInt(config.port, 10) : undefined,
          username: config.username,
          password: config.password,
          database: config.database,
          synchronize: false,
        };
      },
    }),
  ],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
