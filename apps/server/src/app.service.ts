import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World FROM NESTJS! ${process.env.POSTGRES_HOST}`;
  }
}
