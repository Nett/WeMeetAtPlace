import { Module } from '@nestjs/common';
import { PasswordService } from './security/password.service';

@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class ToolsModule {}
