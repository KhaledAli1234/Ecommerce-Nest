import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductAttachmentsDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import {
  BrandRepository,
  CategoryDocument,
  ProductDocument,
  ProductRepository,
  UserDocument,
  CategoryRepository,
  UserRepository,
} from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';
import { FolderEnum, GetAllDto } from 'src/commen';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/repository/database.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    user: UserDocument,
  ): Promise<ProductDocument> {
    const { discountPercent, name, mainPrice, stock, description } =
      createProductDto;
    const category = await this.categoryRepository.findOne({
      filter: { _id: createProductDto.category },
    });
    if (!category) {
      throw new NotFoundException('some of mentioned category are not exist');
    }

    const brand = await this.brandRepository.findOne({
      filter: { _id: createProductDto.brand },
    });
    if (!brand) {
      throw new NotFoundException('some of mentioned brand are not exist');
    }

    let assetFolderId = randomUUID();
    const images = await this.s3Service.uploadFiles({
      files,
      path: `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`,
    });

    const [product] = await this.productRepository.create({
      data: [
        {
          brand: brand._id,
          category: category._id,
          discountPercent,
          name,
          mainPrice,
          stock,
          salePrice: mainPrice - mainPrice * (discountPercent / 100),
          description,
          assetFolderId,
          createdBy: user._id,
        },
      ],
    });
    if (!product) {
      throw new BadRequestException('fail to create this product instance');
    }

    return product;
  }

  async update(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user: UserDocument,
  ): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('some of mentioned product are not exist');
    }
    if (updateProductDto.category) {
      const category = await this.categoryRepository.findOne({
        filter: { _id: updateProductDto.category },
      });
      if (!category) {
        throw new NotFoundException('some of mentioned category are not exist');
      }
      updateProductDto.category = category._id;
    }

    if (updateProductDto.brand) {
      const brand = await this.brandRepository.findOne({
        filter: { _id: updateProductDto.brand },
      });
      if (!brand) {
        throw new NotFoundException('some of mentioned brand are not exist');
      }
      updateProductDto.brand = brand._id;
    }

    let salePrice = product.salePrice;
    if (updateProductDto.mainPrice || updateProductDto.discountPercent) {
      const mainPrice = updateProductDto.mainPrice ?? product.mainPrice;
      const discountPercent =
        updateProductDto.discountPercent ?? product.discountPercent;
      const finalPrice = mainPrice - mainPrice * (discountPercent / 100);
      salePrice = finalPrice > 0 ? finalPrice : 1;
    }
    const updateProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        ...updateProductDto,
        salePrice,
        updatedBy: user._id,
      },
    });

    if (!updateProduct) {
      throw new BadRequestException('fail to update this product instance');
    }

    return updateProduct;
  }

  async updateAttachment(
    productId: Types.ObjectId,
    updateProductAttachmentsDto: UpdateProductAttachmentsDto,
    user: UserDocument,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
      options: { populate: [{ path: 'category' }] },
    });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3Service.uploadFiles({
        files,
        path: `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`,
      });
    }
    const removedAttachments = [
      ...new Set(updateProductAttachmentsDto.removedAttachments ?? []),
    ];
    const updateProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: [
        {
          $set: {
            updatedBy: user._id,
            images: {
              $setUnion: [
                {
                  $setDifference: ['images', removedAttachments],
                },
                attachments,
              ],
            },
          },
        },
      ],
    });
    if (!updateProduct) {
      await this.s3Service.deleteFiles({ urls: attachments });

      throw new BadRequestException('fail to update matching product instance');
    }
    await this.s3Service.deleteFiles({ urls: removedAttachments });

    return updateProduct;
  }

  async freeze(productId: Types.ObjectId, user: UserDocument): Promise<string> {
    const product = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }
    return 'Done';
  }

  async restore(
    productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOneAndUpdate({
      filter: {
        _id: productId,
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
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }
    return product;
  }

  async remove(productId: Types.ObjectId, user: UserDocument): Promise<string> {
    const product = await this.productRepository.findOneAndDelete({
      filter: {
        _id: productId,
        paranoId: false,
        freezedAt: { $exists: true },
      },
    });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }
    await this.s3Service.deleteFiles({ urls: product.images });
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
    result?: ProductDocument[] | Lean<ProductDocument>[];
  }> {
    const { size, page, search } = data;
    const result = await this.productRepository.paginate({
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
    productId: Types.ObjectId,
    archive: boolean = false,
  ): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: {
        _id: productId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
    });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }
    return product;
  }

  async addToWishlist(
    productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<ProductDocument | Lean<ProductDocument>> {
    const product = await this.productRepository.findOne({
      filter: { _id: productId },
    });
    if (!product) {
      throw new NotFoundException('fail to find matching product instance');
    }

    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update: { $addToSet: { wishlist: product._id } },
    });
    return product;
  }

  async removeFromWishlist(
    productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update: {
        $pull: {
          wishlist: Types.ObjectId.createFromHexString(
            productId as unknown as string,
          ),
        },
      },
    });
    return 'Done';
  }
}
