import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailDTO,
  LoginBodyDTO,
  ResendConfirmEmailDTO,
  SignupBodyDTO,
} from './dto/auth.dto';
import { LoginCredentialsResponse } from 'src/commen';
import { LoginResponse } from './entities';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(@Body() body: SignupBodyDTO): Promise<{
    message: string;
  }> {
    await this.authenticationService.signup(body);
    return { message: 'Done' };
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(@Body() body: ResendConfirmEmailDTO): Promise<{
    message: string;
  }> {
    await this.authenticationService.resendConfirmEmail(body);
    return { message: 'Done' };
  }

  @Patch('confirm-Email')
  async confirmEmail(@Body() body: ConfirmEmailDTO): Promise<{
    message: string;
  }> {
    await this.authenticationService.confirmEmail(body);
    return { message: 'Done' };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginBodyDTO): Promise<LoginResponse> {
    const credentials = await this.authenticationService.login(body);
    return { message: 'Done', data: { credentials } };
  }
}
