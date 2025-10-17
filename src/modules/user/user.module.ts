import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  providers: [UserService],
  controllers: [UserController],
  exports: [],
})
export class UserModule {}
