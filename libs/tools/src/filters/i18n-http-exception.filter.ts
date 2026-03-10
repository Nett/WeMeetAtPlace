import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
  } from '@nestjs/common';
import { ValidationError } from 'class-validator';
  import { I18nContext, I18nValidationException } from 'nestjs-i18n';

  const TRANSLATION_NS = ['validation', 'error', 'common'];

  @Catch(HttpException)
  export class I18nHttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      if (host.getType() !== 'http') {
        throw exception;
      }
  
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
  
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const i18n = I18nContext.current(host);

      if (exception instanceof I18nValidationException) {
        const message = this.getFirstValidationMessage(
          exception.errors ?? [],
          i18n,
        );
  
        return response.status(status).json({
          statusCode: status,
          code: 'VALIDATION',
          message: message ?? 'Validation failed',
          path: request.url,
          timestamp: new Date().toISOString(),
        });
      }
  
      const body =
        typeof exceptionResponse === 'string'
          ? {
              statusCode: status,
              message: this.translationTry(i18n, exceptionResponse),
            }
          : this.translateObject(i18n, {
              statusCode: status,
              ...exceptionResponse,
            });
  
      response.status(status).json({
        ...body,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    private getFirstValidationMessage(
        errors: ValidationError[],
        i18n: I18nContext | undefined,
      ): string | undefined {
        for (const error of errors) {
          if (error.constraints) {
            const first = Object.values(error.constraints)[0];
            if (first) {
              return this.translationTry(i18n, first);
            }
          }
    
          if (error.children?.length) {
            const childMessage = this.getFirstValidationMessage(error.children, i18n);
            if (childMessage) {
              return childMessage;
            }
          }
        }
    
        return undefined;
      }
  
    private translateObject(i18n: I18nContext | undefined, value: any): any {
      if (Array.isArray(value)) {
        return value.map((item) => this.translateObject(i18n, item));
      }
  
      if (value && typeof value === 'object') {
        const result: Record<string, any> = {};
        for (const [key, nestedValue] of Object.entries(value)) {
          if (key === 'message') {
            result[key] = this.translateObject(i18n, nestedValue);
          } else {
            result[key] = nestedValue;
          }
        }
        return result;
      }
  
      if (typeof value === 'string') {
        return this.translationTry(i18n, value);
      }
  
      return value;
    }
  
    private translationTry(i18n: I18nContext | undefined, value: string): string {
        if (!i18n) {
            return value;
          }

        if (!new RegExp(`^(${TRANSLATION_NS.join('|')})\\.[\\w.]+(?:\\|.*)?$`).test(value)) {
            return value;
        }
        
        const separatorIndex = value.indexOf('|');
        
        if (separatorIndex > 0) {
            const key = value.slice(0, separatorIndex);
            const rawArgs = value.slice(separatorIndex + 1);
        
            try {
              const parsedArgs = JSON.parse(rawArgs);
              return i18n.t(key as any, { args: parsedArgs }) ?? value;
            } catch {
              return i18n.t(key as any) ?? value;
            }
        }
  
      return i18n.t(value as any) ?? value;
    }
  }