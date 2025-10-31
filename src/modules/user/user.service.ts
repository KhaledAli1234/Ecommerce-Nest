import { Injectable } from '@nestjs/common';
import { IUser, StorageEnum } from 'src/commen';
import { S3Service } from 'src/commen/services/multer.service';
import { UserDocument, UserRepository } from 'src/DB';

@Injectable()
export class UserService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository,
  ) {}

  async profile(user: UserDocument): Promise<UserDocument> {
    const profile = (await this.userRepository.findOne({
      filter: { _id: user._id },
      options: { populate: [{ path: 'wishlist' }] },
    })) as UserDocument;
    return profile;
  }

  async profileImage(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<UserDocument> {
    user.profilePicture = await this.s3Service.uploadFile({
      file,
      storageApproach: StorageEnum.disk,
      path: `user/${user._id.toString()}`,
    });
    await user.save();
    return user;
  }
}
