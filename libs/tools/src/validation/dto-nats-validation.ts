import { ArgumentMetadata, Injectable, PipeTransform, ValidationPipe } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class NatsValidationPipe implements PipeTransform {
  private readonly pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
          const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
          return new RpcException({ 
            ok: false, 
            error: { code: 'VALIDATION', message: `${messages.join(', ')}` } 
          });
      }
    });

    transform(value: unknown, metadata: ArgumentMetadata) {
      return this.pipe.transform(value, metadata);
    }
}