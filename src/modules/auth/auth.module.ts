import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { UserModel, UserRepository } from 'src/DB';

@Module({
  imports: [UserModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository],
  exports: [],
})
export class AuthenticationModule {}
