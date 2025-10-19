import { Controller, Get, Headers, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { PreferredLanguageInterceptor, RoleEnum, User } from 'src/commen';
import { Auth } from 'src/commen/decorators/auth.decorators';
import type { UserDocument } from 'src/DB';

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
}
