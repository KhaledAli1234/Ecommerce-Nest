import type { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from 'src/DB';
import { TokenEnum } from '../enums';

export interface ICredentials {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest extends Request {
  credentials: ICredentials;
  tokenType?: TokenEnum;
}
