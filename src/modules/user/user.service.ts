import { Injectable } from '@nestjs/common';
import { IUser } from 'src/commen';

@Injectable()
export class UserService {
  constructor() {}

  allUsers(): IUser[] {
    return [{ id: 1, username: 'k', email: 'k@gmail.com', password: '0000' }];
  }
}
