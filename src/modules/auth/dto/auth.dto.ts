import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/commen';

export class ResendConfirmEmailDTO {
  @IsEmail()
  email: string;
}
export class ConfirmEmailDTO extends ResendConfirmEmailDTO {
  @Matches(/^\d{6}$/)
  otp: string;
}

export class LoginBodyDTO extends ResendConfirmEmailDTO {
  @IsStrongPassword()
  password: string;
}

export class SignupBodyDTO extends LoginBodyDTO {
  @Length(2, 52)
  @IsNotEmpty()
  @IsString()
  username: string;
  @ValidateIf((data: SignupBodyDTO) => {
    return Boolean(data.password);
  })
  @IsMatch<string>(['password'])
  confirmPassword: string;
}
