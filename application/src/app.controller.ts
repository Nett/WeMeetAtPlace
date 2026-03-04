import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { I18nService, I18nLang } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  getIndex(@Res() res: Response, @I18nLang() lang: string) {
    const nodeEnv = process.env.NODE_ENV || 'development';
    return res.render('index', {
      applicationName: process.env.APPLICATION_NAME,
      lang,
      showEnvMarker: nodeEnv !== 'production',
      envLabel: nodeEnv.toUpperCase(),
    });
  }
}
