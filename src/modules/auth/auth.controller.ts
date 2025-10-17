import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { LoginBodyDTO, SignupBodyDTO } from './dto/auth.dto';

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

  @HttpCode(200)
  @Post('login')
  login(@Body() body: LoginBodyDTO) {
    return { message: 'Done' };
  }
}
