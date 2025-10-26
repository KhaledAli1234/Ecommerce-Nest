import {
  Controller,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  cloudFileUpload,
  fileValidation,
  PreferredLanguageInterceptor,
  RoleEnum,
  StorageEnum,
  successResponse,
  User,
} from 'src/commen';
import { Auth } from 'src/commen/decorators/auth.decorators';
import type { UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { IResponse, IUser } from '../../commen/interfaces';
import { profileResponse } from './entities';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({
        storageApproach: StorageEnum.disk,
        validation: fileValidation.image,
      }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<IResponse<profileResponse>> {
    const profile = await this.userService.profileImage(file, user);
    return successResponse<profileResponse>({ data: { profile } });
  }
}
