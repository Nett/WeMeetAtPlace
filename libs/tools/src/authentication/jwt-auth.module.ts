import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtEnv } from './jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

@Module({
    imports: [
        ConfigModule.forFeature(JwtEnv),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JwtEnv.secret'),
                expiresIn: configService.get<string>('JwtEnv.expiresIn'),
            }),
        }),
    ],
    providers: [JwtAuthService],
    exports: [JwtAuthService],
})
export class JwtAuthModule {}
