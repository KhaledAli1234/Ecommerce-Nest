import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/commen';

export class LoginBodyDTO {
  @IsEmail()
  email: string;
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
