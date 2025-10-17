import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class SecuirtyService {
  constructor() {}

  generatHash = async (
    plainText: string,
    saltRound: number = parseInt(process.env.SALT as string),
  ): Promise<string> => {
    return await hash(plainText, saltRound);
  };

  compareHash = async (
    plainText: string,
    hashValue: string,
  ): Promise<boolean> => {
    return await compare(plainText, hashValue);
  };
}
