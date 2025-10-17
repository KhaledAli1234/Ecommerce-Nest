import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IUser, SecuirtyService } from 'src/commen';
import { UserRepository } from 'src/DB';
import { SignupBodyDTO } from './dto/auth.dto';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(data: SignupBodyDTO): Promise<string> {
    const { email, username, password } = data;
    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      throw new ConflictException('Email Exist');
    }
    const [user] = await this.userRepository.create({
      data: [{ username, email, password }],
    });
    if (!user) {
      throw new BadRequestException('fail to signup');
    }
    return 'Done';
  }
}
