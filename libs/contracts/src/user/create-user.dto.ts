import { IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Match } from '../validators/match.decorator';

export const CREATE_USER_PATTERN = 'user.create';

export class CreateUserDto {
  @IsDefined({ message: i18nValidationMessage('validation.nickname_required') })
  @IsString({ message: i18nValidationMessage('validation.nickname_required') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.nickname_required') })
  @MinLength(4, { message: i18nValidationMessage('validation.nickname_min_length') })
  @MaxLength(100, { message: i18nValidationMessage('validation.nickname_max_length') })
  nickname: string;

  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Match<CreateUserDto>('password', {
    message: i18nValidationMessage('validation.passwords_do_not_match'),
  })
  re_password: string;

  
}
