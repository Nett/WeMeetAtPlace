import { NatsResult } from '@app/contracts';
import { BadRequestException, ConflictException, GatewayTimeoutException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  handleNatsResponse<TRes>(result: NatsResult<TRes>): TRes {
    if (!result?.ok) {
      switch (result?.error?.code) {
        case 'VALIDATION':
          throw new BadRequestException({ ...result.error });
        case 'CONFLICT':
          throw new ConflictException({ ...result.error });
        case 'NOT_FOUND':
          throw new NotFoundException({ ...result.error });
        case 'TIME_OUT':
          throw new GatewayTimeoutException({ ...result.error })
        default:
          throw new InternalServerErrorException({
            code: 'INTERNAL',
            message: result.error.message ?? 'errors.unknown_error',
          });
      }
    }

    return result.data;
  }
}
