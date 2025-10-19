import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import {
  OtpModel,
  OtpRepository,
  TokenModel,
  TokenRepository,
  UserModel,
  UserRepository,
} from 'src/DB';
import { SecuirtyService, TokenService } from 'src/commen';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModel, OtpModel, TokenModel],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UserRepository,
    OtpRepository,
    SecuirtyService,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  exports: [],
})
export class AuthenticationModule {}
