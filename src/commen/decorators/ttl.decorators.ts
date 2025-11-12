import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../enums';

export const TTLNAME = 'TTLNAME';
export const TTL = (expires: number) => {
  return SetMetadata(TTLNAME, expires);
};
