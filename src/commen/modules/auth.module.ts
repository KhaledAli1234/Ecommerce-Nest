import { Global, Module } from '@nestjs/common';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/DB';
import { TokenService } from 'src/commen';
import { JwtService } from '@nestjs/jwt';
@Global()
@Module({
  imports: [UserModel, TokenModel],
  controllers: [],
  providers: [UserRepository, JwtService, TokenService, TokenRepository],
  exports: [
    UserModel,
    TokenModel,
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
})
export class SharedAuthenticationModule {}
