import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthService {
    constructor(private readonly jwtService: JwtService) {}

    async sign(payload: any): Promise<string> {
        return this.jwtService.signAsync(payload);
    }

    async verify(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token);
    }
}