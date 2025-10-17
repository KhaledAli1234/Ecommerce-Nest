import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, generatHash, providerEnum, RoleEnum } from 'src/commen';

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 25,
    trim: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 25,
    trim: true,
  })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (vaule: string) {
      const [firstName, lastName] = vaule.split(' ') || [];
      this.set({ firstName, lastName });
    },
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: Date,
  })
  confirmEmail: Date;

  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === providerEnum.GOOGLE ? false : true;
    },
  })
  password: string;

  @Prop({
    type: String,
    enum: providerEnum,
    default: providerEnum.SYSTEM,
  })
  provider: providerEnum;

  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.male,
  })
  gender: GenderEnum;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.user,
  })
  role: RoleEnum;

  @Prop({
    type: Date,
  })
  changeCredentialsTime: Date;
}

const userSchema = SchemaFactory.createForClass(User);
userSchema.pre('save', async function (next) {
  // this.wasNew = this.isNew;
  if (this.isModified('password')) {
    this.password = await generatHash(this.password);
  }
  // if (this.isModified('confirmEmailOtp')) {
  //   this.confirmEmailPlainOtp = this.confirmEmailOtp as string;
  //   this.confirmEmailOtp = await generatHash(this.confirmEmailOtp as string);
  // }
  next();
});
export type UserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
