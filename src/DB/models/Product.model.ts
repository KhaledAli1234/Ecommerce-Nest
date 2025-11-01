import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { IBrand, ICategory, IProduct } from 'src/commen';
import { Category } from './Category.model';

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class Product implements IProduct {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 2000,
  })
  name: string;

  @Prop({
    type: String,
    minlength: 2,
    maxlength: 50,
  })
  slug: string;

  @Prop({
    type: String,
    minlength: 2,
    maxlength: 50000,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
  })
  assetFolderId: string;

  @Prop({
    type: [String],
    required: true,
  })
  images: string[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Brand',
  })
  brand: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
  })
  category: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
  })
  discountPercent: number;

  @Prop({
    type: Number,
    required: true,
  })
  salePrice: number;

  @Prop({
    type: Number,
    required: true,
  })
  mainPrice: number;

  @Prop({
    type: Number,
    required: true,
  })
  stock: number;

  @Prop({
    type: Number,
    default: 0,
  })
  soldItems: number;

  @Prop([
    {
      size: { type: String, required: true },
      color: { type: String, required: true },
      price: { type: Number, required: true },
      sku: { type: String, required: true },
      stock: { type: Number, default: 0 },
    },
  ])
  variants: {
    size: string;
    color: string;
    price: number;
    sku: string;
    stock: number;
  }[];

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  updatedBy?: Types.ObjectId;

  @Prop({
    type: Date,
  })
  freezedAt?: Date;

  @Prop({
    type: Date,
  })
  restoredAt?: Date;
}

const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});
productSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<ProductDocument>;
  if (update.name) {
    this.setUpdate({ ...update, slug: slugify(update.name) });
  }
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});
productSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();
  if (query.paranoId === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } });
  }
  next();
});

export type ProductDocument = HydratedDocument<Product>;
export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: productSchema },
]);
