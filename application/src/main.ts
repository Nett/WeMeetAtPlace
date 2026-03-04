import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import hbs = require('hbs');
import { I18nService } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const i18n = app.get(I18nService);
  hbs.registerHelper('t', (key: string, options: any) => {
    const lang = options.data?.root?.lang || 'en';
    return i18n.translate(key as never, { lang });
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
