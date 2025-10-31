import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { S3Service } from 'src/commen/services/multer.service';
import {
  BrandRepository,
  CategoryDocument,
  CategoryRepository,
  UserDocument,
} from 'src/DB';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { FolderEnum, GetAllDto } from 'src/commen';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument> {
    const { name } = createCategoryDto;
    const checkDuplicated = await this.categoryRepository.findOne({
      filter: { name, paranoId: false },
    });
    if (checkDuplicated) {
      throw new ConflictException(
        checkDuplicated.freezedAt
          ? 'Duplicated with archived Category'
          : 'Duplicated Category name',
      );
    }

    const brands: Types.ObjectId[] = [
      ...new Set(createCategoryDto.brands || []),
    ];
    if (
      brands &&
      (await this.brandRepository.find({ filter: { _id: { $in: brands } } }))
        .length != brands.length
    ) {
      throw new NotFoundException('some of mentioned brands are not exist');
    }
    let assetFolderId: string = randomUUID();
    const image: string = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Category}/${assetFolderId}`,
    });
    const [category] = await this.categoryRepository.create({
      data: [
        {
          ...createCategoryDto,
          image,
          assetFolderId,
          createdBy: user._id,
          brands: brands.map((brand) => {
            return Types.ObjectId.createFromHexString(
              brand as unknown as string,
            );
          }),
        },
      ],
    });
    if (!category) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Fail to create this Category resource');
    }

    return category;
  }

  async update(
    categoryId: Types.ObjectId,
    updateCategoryDto: UpdateCategoryDto,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    if (
      updateCategoryDto.name &&
      (await this.categoryRepository.findOne({
        filter: { name: updateCategoryDto },
      }))
    ) {
      throw new ConflictException('Duplicated Category name');
    }

    const brands: Types.ObjectId[] = [
      ...new Set(updateCategoryDto.brands || []),
    ];
    if (
      brands &&
      (await this.brandRepository.find({ filter: { _id: { $in: brands } } }))
        .length != brands.length
    ) {
      throw new NotFoundException('some of mentioned brands are not exist');
    }

    const removeBrands = updateCategoryDto.brands ?? [];
    delete updateCategoryDto.removeBrands;

    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: [
        {
          $set: {
            ...updateCategoryDto,
            updatedBy: user._id,
            brands: {
              $setUnion: [
                {
                  $setDifference: [
                    '$brands',
                    (removeBrands || []).map((brand) => {
                      return Types.ObjectId.createFromHexString(
                        brand as unknown as string,
                      );
                    }),
                  ],
                },
                brands.map((brand) => {
                  return Types.ObjectId.createFromHexString(
                    brand as unknown as string,
                  );
                }),
              ],
            },
          },
        },
      ],
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    return category;
  }

  async updateAttachment(
    categoryId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    const image = await this.s3Service.uploadFile({
      file,
      path: `${FolderEnum.Category}/${category.assetFolderId}`,
    });
    const updateCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: { image, updatedBy: user._id },
    });
    if (!updateCategory) {
      await this.s3Service.deleteFile({ Key: image });
      throw new NotFoundException('fail to find matching Category instance');
    }
    await this.s3Service.deleteFile({ Key: category.image });
    return updateCategory;
  }

  async freeze(
    categoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    const category = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: categoryId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    return 'Done';
  }

  async restore(
    categoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOneAndUpdate({
      filter: {
        _id: categoryId,
        paranoId: false,
        freezedAt: { $exists: true },
      },
      update: {
        restoredAt: new Date(),
        $unset: { freezedAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    return category;
  }

  async remove(
    categoryId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    const category = await this.categoryRepository.findOneAndDelete({
      filter: {
        _id: categoryId,
        paranoId: false,
        freezedAt: { $exists: true },
      },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    await this.s3Service.deleteFile({ Key: category.image });
    return 'Done';
  }

  async findAll(
    data: GetAllDto,
    archive: boolean = false,
  ): Promise<{
    docCount?: number;
    limit?: number;
    pages?: number;
    currentPage?: number | undefined;
    result?: CategoryDocument[] | Lean<CategoryDocument>[];
  }> {
    const { size, page, search } = data;
    const result = await this.categoryRepository.paginate({
      filter: {
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
              ],
            }
          : {}),
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      page,
      size,
    });
    return result;
  }

  async findOne(
    categoryId: Types.ObjectId,
    archive: boolean = false,
  ): Promise<CategoryDocument | Lean<CategoryDocument>> {
    const category = await this.categoryRepository.findOne({
      filter: {
        _id: categoryId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
    });
    if (!category) {
      throw new NotFoundException('fail to find matching Category instance');
    }
    return category;
  }
}
