import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { preAuth } from 'src/commen/middleware/authentication.Middleware';
import { S3Service } from 'src/commen/services/multer.service';

@Module({
  imports: [],
  providers: [UserService , S3Service],
  controllers: [UserController],
  exports: [],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(preAuth).forRoutes(UserController);
  }
}
