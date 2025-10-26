import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  BrandRepository,
  CategoryRepository,
  ProductDocument,
  ProductRepository,
  UserDocument,
} from 'src/DB';
import { S3Service } from 'src/commen/services/multer.service';
import { FolderEnum } from 'src/commen';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
    private readonly s3Service: S3Service,
  ) {}
  
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    user: UserDocument,
  ):Promise<ProductDocument> {
    const { discountPercent, name, originalPrice, stock, description } =
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
          originalPrice,
          stock,
          salePrice: originalPrice - originalPrice * (discountPercent / 100),
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

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
