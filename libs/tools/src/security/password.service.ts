import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
    private readonly defaultRounds = 10;

    async hash(plain: string): Promise<string> {
        if (plain.length > 72) {
            throw new Error('Password too long (max 50 chars)');
          }
          return bcrypt.hash(plain, this.defaultRounds);;
    }

    async verify(hash: string, plain: string): Promise<boolean> {
        if (plain.length > 72) return false;
        return bcrypt.compare(plain, hash);
      }
}
