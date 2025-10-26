import { Model } from 'mongoose';
import { DatabaseRepository } from './database.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument as TDocument, Category } from '../models';

@Injectable()
export class CategoryRepository extends DatabaseRepository<Category> {
  constructor(
    @InjectModel(Category.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
