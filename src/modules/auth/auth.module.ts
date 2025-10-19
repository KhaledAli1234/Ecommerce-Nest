import { Module } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { AuthenticationController } from './auth.controller';
import { OtpModel, OtpRepository } from 'src/DB';
import { SecuirtyService } from 'src/commen';

@Module({
  imports: [OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, OtpRepository, SecuirtyService],
  exports: [],
})
export class AuthenticationModule {}
