import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './commen/services/multer.service';
import type { Response } from 'express';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';

const createS3WriteStreamPipe = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/upload/*path')
  async getAssetsUrl(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: string[] },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { download, filename } = query;
    const { path } = params;
    const Key = path.join('/');
    const s3Response = await this.s3Service.getFile({ Key });
    if (!s3Response?.Body) {
      throw new BadRequestException('fail to fetch this asset');
    }
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader(
      'Content-type',
      `${s3Response.ContentType || 'application/octet-stream'}`,
    );
    if (download === 'true') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename || Key.split('/').pop()}"`,
      );
    }

    return await createS3WriteStreamPipe(
      s3Response.Body as NodeJS.ReadableStream,
      res,
    );
  }

  @Get('/upload/pre-signed/*path')
  async getPresignedAssetsUrl(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: string[] },
  ) {
    const { download, filename } = query;
    const { path } = params;
    const Key = path.join('/');
    const url = await this.s3Service.createGetPresignedLink({
      Key,
      download,
      filename,
    });
    return { message: 'Done', data: { url } };
  }
}
