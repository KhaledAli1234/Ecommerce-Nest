import { diskStorage, memoryStorage } from 'multer';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { StorageEnum } from 'src/commen/enums';

export const cloudFileUpload = ({
  storageApproach = StorageEnum.memory,
  validation = [],
  fileSize = 2,
}: {
  storageApproach?: StorageEnum;
  validation: string[];
  fileSize?: number;
}): MulterOptions => {
  return {
    storage:
      storageApproach === StorageEnum.memory
        ? memoryStorage()
        : diskStorage({
            destination: tmpdir(),
            filename: function (
              req: Request,
              file: Express.Multer.File,
              callback,
            ) {
              callback(null, `${randomUUID()}_${file.originalname}`);
            },
          }),

    fileFilter(req: Request, file: Express.Multer.File, callback: Function) {
      if (!validation.includes(file.mimetype)) {
        return callback(new BadRequestException('invalid file format'));
      }
      return callback(null, true);
    },

    limits: { fileSize: fileSize * 1024 * 1024 },
  };
};
