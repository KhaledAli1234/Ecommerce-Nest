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
  GmailDTO,
  LoginBodyDTO,
  ResendConfirmEmailDTO,
  ResetForgotPasswordDTO,
  SendForgotPasswordDTO,
  SignupBodyDTO,
  VerifyForgotPasswordDTO,
} from './dto/auth.dto';
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

  @Patch('send-forgot-password')
  async sendForgotPassword(
    @Body() body: SendForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authenticationService.sendForgotPassword(body);
    return { message: 'Done' };
  }

  @Patch('verify-forgot-password')
  async verifyForgotPassword(
    @Body() body: VerifyForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authenticationService.verifyForgotPassword(body);
    return { message: 'Done' };
  }

  @Patch('reset-forgot-password')
  async resetForgotPassword(
    @Body() body: ResetForgotPasswordDTO,
  ): Promise<{ message: string }> {
    await this.authenticationService.resetForgotPassword(body);
    return { message: 'Done' };
  }

  @Post('signup-gmail')
  async signupWithGmail(@Body() body: GmailDTO): Promise<LoginResponse> {
    const credentials = await this.authenticationService.signupWithGmail(body);
    return { message: 'Done', data: { credentials } };
  }

  @Post('login-gmail')
  @HttpCode(200)
  async loginWithGmail(@Body() body: GmailDTO): Promise<LoginResponse> {
    const credentials = await this.authenticationService.loginWithGmail(body);
    return { message: 'Done', data: { credentials } };
  }
}
