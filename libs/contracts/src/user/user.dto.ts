import { IsDefined, IsEmail, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Match } from '../validators/match.decorator';
import { PickType, IntersectionType } from '@nestjs/swagger'

class UserBaseDto {
  @IsDefined({ message: i18nValidationMessage('validation.nickname_required') })
  @IsString({ message: i18nValidationMessage('validation.nickname_required') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.nickname_required') })
  @MinLength(4, { message: i18nValidationMessage('validation.nickname_min_length') })
  @MaxLength(20, { message: i18nValidationMessage('validation.nickname_max_length') })
  nickname: string;

  @IsDefined()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;
}

export class UserLoginDto extends PickType(UserBaseDto, ['nickname'] as const) {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}

export class UserCreateDto extends IntersectionType(UserBaseDto, UserLoginDto) {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @Match<UserLoginDto>('password', {
    message: i18nValidationMessage('validation.passwords_do_not_match'),
  })
  re_password: string;
}

export class UserProfileDto extends IntersectionType(UserBaseDto) {
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  created_at: Date;

  @IsOptional()
  avatar?: string;
}