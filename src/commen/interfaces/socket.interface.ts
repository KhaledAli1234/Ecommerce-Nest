import { Socket } from 'Socket.io';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from 'src/DB';

export interface ISocketAuth extends Socket {
  credentials: {
    user: UserDocument;
    decoded: JwtPayload;
  };
}
