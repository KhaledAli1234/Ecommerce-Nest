import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  createNumericalOtp,
  LoginCredentialsResponse,
  OtpEnum,
  providerEnum,
  SecuirtyService,
  TokenService,
} from 'src/commen';
import {
  OtpRepository,
  UserDocument,
  UserRepository,
} from 'src/DB';
import {
  ConfirmEmailDTO,
  LoginBodyDTO,
  ResendConfirmEmailDTO,
  SignupBodyDTO,
} from './dto/auth.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly secuirtyServic: SecuirtyService,
    private readonly tokenService: TokenService,
  ) {}

  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          otp: createNumericalOtp(),
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.ConfirmEmail,
        },
      ],
    });
  }

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

    await this.createConfirmEmailOtp(user._id);
    return 'Done';
  }
  async resendConfirmEmail(data: ResendConfirmEmailDTO): Promise<string> {
    const { email } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.ConfirmEmail } }],
      },
    });
    if (!user) {
      throw new NotFoundException('fail to find matching account');
    }
    if (user.otp?.length) {
      throw new ConflictException(
        `sorry we cannot grant you new OTP , please try again after:${user.otp[0].expiredAt}`,
      );
    }

    await this.createConfirmEmailOtp(user._id);

    return 'Done';
  }
  async confirmEmail(data: ConfirmEmailDTO): Promise<string> {
    const { email, otp } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.ConfirmEmail } }],
      },
    });
    if (!user) {
      throw new NotFoundException('fail to find matching account');
    }
    if (
      !(
        user.otp?.length &&
        (await this.secuirtyServic.compareHash(otp, user.otp[0].otp))
      )
    ) {
      throw new BadRequestException('invalid otp');
    }

    user.confirmedAt = new Date();
    await user.save();
    await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } });

    return 'Done';
  }
  async login(data: LoginBodyDTO): Promise<LoginCredentialsResponse> {
    const { email, password } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider: providerEnum.SYSTEM,
      },
    });
    if (!user) {
      throw new NotFoundException('fail to find matching account');
    }
    if (!(await this.secuirtyServic.compareHash(password, user.password))) {
      throw new NotFoundException('fail to find matching account');
    }
    const credentials = await this.tokenService.createLoginCredentials(
      user as UserDocument,
    );

    return credentials;
  }
}
