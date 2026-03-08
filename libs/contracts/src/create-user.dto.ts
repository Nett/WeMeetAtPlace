import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export const CREATE_USER_PATTERN = 'user.create';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nickname: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
