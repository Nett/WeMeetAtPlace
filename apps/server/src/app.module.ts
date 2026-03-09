import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { NatsEnvValidationSchema } from '@app/nats';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: ['production', 'staging'].includes(process.env.NODE_ENV || ''),
      envFilePath: join(process.cwd(), 'apps', 'server', '.env'),
      validationSchema: NatsEnvValidationSchema,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../../../i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
