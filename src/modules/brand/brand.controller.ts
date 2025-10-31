import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Patch,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import {
  Auth,
  cloudFileUpload,
  fileValidation,
  GetAllDto,
  GetAllResponse,
  IBrand,
  IResponse,
  successResponse,
  User,
} from 'src/commen';
import type { UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandResponse } from './entities/brand.entity';

import {
  BrandParamsDto,
  UpdateBrandDto,
} from './dto/update-brand.dto';
import { endPoint } from './brand.authorization.module';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({
        validation: fileValidation.image,
      }),
    ),
  )
  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe)
    file: Express.Multer.File,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, file, user);
    return successResponse<BrandResponse>({ status: 201, data: { brand } });
  }

  @Auth(endPoint.create)
  @Patch(':brandId')
  async update(
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(
      params.brandId,
      updateBrandDto,
      user,
    );
    return successResponse<BrandResponse>({ data: { brand } });
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({
        validation: fileValidation.image,
      }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':brandId/attachment')
  async updateAttachment(
    @Param() params: BrandParamsDto,
    @UploadedFile(ParseFilePipe)
    file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateAttachment(
      params.brandId,
      file,
      user,
    );
    return successResponse<BrandResponse>({ data: { brand } });
  }

  @Auth(endPoint.create)
  @Delete(':brandId/freeze')
  async freeze(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.brandService.freeze(params.brandId, user);
    return successResponse();
  }

  @Auth(endPoint.create)
  @Patch(':brandId/restore')
  async restore(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.restore(params.brandId, user);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  @Auth(endPoint.create)
  @Delete(':brandId')
  async remove(
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.brandService.remove(params.brandId, user);
    return successResponse();
  }

  @Get()
  async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } });
  }

  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query, true);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } });
  }

  @Get(':brandId')
  async findOne(
    @Param() params: BrandParamsDto,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  @Auth(endPoint.create)
  @Get(':brandId/archive')
  async findOneArchive(
    @Param() params: BrandParamsDto,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId, true);
    return successResponse<BrandResponse>({ data: { brand } });
  }
}
