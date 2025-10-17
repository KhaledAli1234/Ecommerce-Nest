import { Body, Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from 'src/commen';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.userService.allUsers();
    return { message: 'Done', data: { users } };
  }
}
