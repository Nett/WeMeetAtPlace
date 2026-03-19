import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import hbs = require('hbs');
import { I18nService, I18nValidationPipe } from 'nestjs-i18n';
import { I18nHttpExceptionFilter } from '@app/tools';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api', { exclude: ['/', '/health', 'public', 'views'] });

  app.useGlobalPipes(
    new I18nValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true })
  );

  app.useGlobalFilters(new I18nHttpExceptionFilter());

  const isContainer = ['production', 'staging'].includes(process.env.NODE_ENV || '');
  const viewsDir = isContainer
    ? join(process.cwd(), 'views')
    : join(process.cwd(), 'apps', 'server', 'views');
  const publicDir = isContainer
    ? join(process.cwd(), 'public')
    : join(process.cwd(), 'apps', 'server', 'public');
  app.useStaticAssets(publicDir);
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');

  const i18n = app.get(I18nService);
  hbs.registerHelper('t', (key: string, options: any) => {
    const lang = options.data?.root?.lang || 'en';
    return i18n.translate(key as never, { lang });
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
