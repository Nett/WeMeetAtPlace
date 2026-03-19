import { BadRequestException, GatewayTimeoutException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_CLIENT, NATS_TIMEOUT } from './nats.constant';
import { catchError, firstValueFrom, of, throwError, timeout, TimeoutError } from 'rxjs';
import { NatsResult } from '@app/contracts';

@Injectable()
export class NatsService {
    constructor(@Inject(NATS_CLIENT) private readonly natsClient: ClientProxy,) {}

    async sendRequest<TResponse, TPayload>(pattern: string, payload: TPayload): Promise<TResponse> {
        return firstValueFrom(
            this.natsClient.send<TResponse, TPayload>(pattern, payload).pipe(
                timeout(NATS_TIMEOUT),
                catchError((err) => {
                    if (err instanceof TimeoutError) {
                      return of({
                        ok: false,
                        error: {
                          code: 'TIME_OUT',
                          message: 'NATS timeout',
                        },
                      } as TResponse);
                    }
            
                    if (err?.error?.code === 'VALIDATION') {
                      return of(err as TResponse);
                      }
            
                    return of({
                        ok: false,
                        error: {
                          code: err?.error.code ?? 'INTERNAL',
                          message: err?.error?.message ?? 'Microservice error',
                        },
                      } as TResponse);
            })
        ));
    }
}
