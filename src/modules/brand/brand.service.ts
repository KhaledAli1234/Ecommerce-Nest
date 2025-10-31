import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository, UserDocument } from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';
import { FolderEnum, GetAllDto } from 'src/commen';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;
    const checkDuplicated = await this.brandRepository.findOne({
      filter: { name, paranoId: false },
    });
    if (checkDuplicated) {
      throw new ConflictException(
        checkDuplicated.freezedAt
          ? 'Duplicated with archived brand'
          : 'Duplicated brand name',
      );
    }
    const image: string = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Brand,
    });
    const [brand] = await this.brandRepository.create({
      data: [{ name, slogan, image, createdBy: user._id }],
    });
    if (!brand) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException('Fail to create this brand resource');
    }

    return brand;
  }

  async update(
    brandId: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    user: UserDocument,
  ): Promise<BrandDocument | Lean<BrandDocument>> {
    if (
      updateBrandDto.name &&
      (await this.brandRepository.findOne({ filter: { name: updateBrandDto } }))
    ) {
      throw new ConflictException('Duplicated brand name');
    }

    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: { ...updateBrandDto, updatedBy: user._id },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    return brand;
  }

  async updateAttachment(
    brandId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<BrandDocument | Lean<BrandDocument>> {
    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Brand,
    });
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: { image, updatedBy: user._id },
      options: { new: false },
    });
    if (!brand) {
      await this.s3Service.deleteFile({ Key: image });
      throw new NotFoundException('fail to find matching brand instance');
    }
    await this.s3Service.deleteFile({ Key: brand.image });
    brand.image = image;
    return brand;
  }

  async freeze(brandId: Types.ObjectId, user: UserDocument): Promise<string> {
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    return 'Done';
  }

  async restore(
    brandId: Types.ObjectId,
    user: UserDocument,
  ): Promise<BrandDocument | Lean<BrandDocument>> {
    const brand = await this.brandRepository.findOneAndUpdate({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
      update: {
        restoredAt: new Date(),
        $unset: { freezedAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    return brand;
  }

  async remove(brandId: Types.ObjectId, user: UserDocument): Promise<string> {
    const brand = await this.brandRepository.findOneAndDelete({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    await this.s3Service.deleteFile({ Key: brand.image });
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
    result?: BrandDocument[] | Lean<BrandDocument>[];
  }> {
    const { size, page, search } = data;
    const result = await this.brandRepository.paginate({
      filter: {
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { slogan: { $regex: search, $options: 'i' } },
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
    brandId: Types.ObjectId,
    archive: boolean = false,
  ): Promise<BrandDocument | Lean<BrandDocument>> {
    const brand = await this.brandRepository.findOne({
      filter: {
        _id: brandId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
    });
    if (!brand) {
      throw new NotFoundException('fail to find matching brand instance');
    }
    return brand;
  }
}
