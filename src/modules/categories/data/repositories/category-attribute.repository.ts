import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { BaseMongoRepository } from 'src/common/database/base-mongo.repository';
import { CategoryAttribute } from '../entities/category.entity';

@Injectable()
export class CategoryAttributeRepository extends BaseMongoRepository<CategoryAttribute> {
  constructor(
    @InjectRepository(CategoryAttribute)
    repository: MongoRepository<CategoryAttribute>,
  ) {
    super(repository);
  }

  findByCategoryId(categoryId: ObjectId) {
    return this.findBy({ categoryId });
  }

  findByCategoryIdAndId(categoryId: ObjectId, attributeId: ObjectId) {
    return this.findOneBy({ categoryId, _id: attributeId });
  }

  deleteByCategoryId(categoryId: ObjectId) {
    return this.deleteManyBy({ categoryId });
  }
}
