import { NatsResult } from '@app/contracts';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  handleNatsResponse(result: NatsResult<Record<string, unknown>>): Record<string, unknown> {
    if (!result?.ok) {
      switch (result?.error?.code) {
        case 'VALIDATION':
          throw new BadRequestException({ ...result.error });
        case 'CONFLICT':
          throw new ConflictException({ ...result.error });
        case 'NOT_FOUND':
          throw new NotFoundException({ ...result.error });
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
