import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
  Query,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductParamsDto,
  UpdateProductAttachmentsDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Auth,
  cloudFileUpload,
  fileValidation,
  GetAllDto,
  GetAllResponse,
  IProduct,
  IResponse,
  RedisCacheInterceptor,
  RoleEnum,
  StorageEnum,
  successResponse,
  TTL,
  User,
} from 'src/commen';
import { endPoint } from './product.authorization.module';
import type { UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { type RedisClientType } from 'redis';
import { Observable, of } from 'rxjs';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    private readonly productService: ProductService,
  ) {}

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(ParseFilePipe)
    files: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(
      createProductDto,
      files,
      user,
    );
    return successResponse<ProductResponse>({
      status: 201,
      data: { product },
    });
  }

  @Auth(endPoint.create)
  @Patch(':productId')
  async update(
    @Param() params: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':productId/attachment')
  async updateAttachment(
    @Param() params: ProductParamsDto,
    @Body() updateProductAttachmentsDto: UpdateProductAttachmentsDto,
    @User() user: UserDocument,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    files?: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(
      params.productId,
      updateProductAttachmentsDto,
      user,
      files,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(endPoint.create)
  @Delete(':productId/freeze')
  async freeze(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.freeze(params.productId, user);
    return successResponse();
  }

  @Auth(endPoint.create)
  @Patch(':productId/restore')
  async restore(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.restore(params.productId, user);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(endPoint.create)
  @Delete(':productId')
  async remove(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.remove(params.productId, user);
    return successResponse();
  }

  @TTL(50)
  @UseInterceptors(RedisCacheInterceptor)
  @Get()
  async findAll(
    @Query() query: GetAllDto,
  ): Promise<Observable<IResponse<GetAllResponse<IProduct>>>> {
    const result = await this.productService.findAll(query);
    return of(successResponse<GetAllResponse<IProduct>>({ data: { result } }));
  }

  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  @Get(':productId')
  async findOne(
    @Param() params: ProductParamsDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(endPoint.create)
  @Get(':productId/archive')
  async findOneArchive(
    @Param() params: ProductParamsDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId, true);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/add-to-wishlist')
  async addToWishlist(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.addToWishlist(
      params.productId,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/remove-from-wishlist')
  async removeFromWishlist(
    @Param() params: ProductParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.removeFromWishlist(params.productId, user);
    return successResponse();
  }
}
