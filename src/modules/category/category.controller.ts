import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Auth,
  cloudFileUpload,
  fileValidation,
  IResponse,
  successResponse,
  User,
} from 'src/commen';
import type { UserDocument } from 'src/DB';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponse, GetAllResponse } from './entities/category.entity';
import {
  CategoryParamsDto,
  GetAllDto,
  UpdateCategoryDto,
} from './dto/update-category.dto';
import { endPoint } from './category.authorization.module';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe)
    file: Express.Multer.File,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(
      createCategoryDto,
      file,
      user,
    );
    return successResponse<CategoryResponse>({
      status: 201,
      data: { category },
    });
  }

  @Auth(endPoint.create)
  @Patch(':categoryId')
  async update(
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(
      params.categoryId,
      updateCategoryDto,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
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
  @Patch(':categoryId/attachment')
  async updateAttachment(
    @Param() params: CategoryParamsDto,
    @UploadedFile(ParseFilePipe)
    file: Express.Multer.File,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(
      params.categoryId,
      file,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endPoint.create)
  @Delete(':categoryId/freeze')
  async freeze(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.categoryService.freeze(params.categoryId, user);
    return successResponse();
  }

  @Auth(endPoint.create)
  @Patch(':categoryId/restore')
  async restore(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(
      params.categoryId,
      user,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endPoint.create)
  @Delete(':categoryId')
  async remove(
    @Param() params: CategoryParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.categoryService.remove(params.categoryId, user);
    return successResponse();
  }

  @Get()
  async findAll(@Query() query: GetAllDto): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAll(query);
    return successResponse<GetAllResponse>({ data: { result } });
  }

  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse>> {
    const result = await this.categoryService.findAll(query, true);
    return successResponse<GetAllResponse>({ data: { result } });
  }

  @Get(':categoryId')
  async findOne(
    @Param() params: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.categoryId);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  @Auth(endPoint.create)
  @Get(':categoryId/archive')
  async findOneArchive(
    @Param() params: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(
      params.categoryId,
      true,
    );
    return successResponse<CategoryResponse>({ data: { category } });
  }
}
