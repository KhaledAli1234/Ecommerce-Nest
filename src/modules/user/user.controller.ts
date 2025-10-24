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
  User,
} from 'src/commen';
import { Auth } from 'src/commen/decorators/auth.decorators';
import type { UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUser } from '../../commen/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user])
  @Get()
  profile(
    @Headers() headers: any,
    @User() user: UserDocument,
  ): { message: string } {
    console.log({
      lang: headers['accept-language'],
      user,
    });

    return { message: 'Done' };
  }

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
  ): Promise<{ message: string; data: { profile: IUser } }> {
    const profile = await this.userService.profileImage(file, user);
    return { message: 'Done', data: { profile } };
  }
}
