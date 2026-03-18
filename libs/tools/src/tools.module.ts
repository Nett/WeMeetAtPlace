import { Module } from '@nestjs/common';
import { PasswordService } from './security/password.service';
import { JwtAuthModule } from './authentication/jwt-auth.module';

@Module({
  imports: [JwtAuthModule],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class ToolsModule {}
